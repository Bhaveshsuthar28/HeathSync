package com.Heath.Backend.Config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;

import javax.sql.DataSource;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.Locale;

@Configuration
public class DataSourceConfig {

    @Bean
    public DataSource dataSource(Environment environment) {
        ResolvedDb resolved = resolveDatabase(environment);

        HikariConfig config = new HikariConfig();
        config.setJdbcUrl(resolved.jdbcUrl);
        if (resolved.username != null) {
            config.setUsername(resolved.username);
        }
        if (resolved.password != null) {
            config.setPassword(resolved.password);
        }

        return new HikariDataSource(config);
    }

    private static ResolvedDb resolveDatabase(Environment environment) {
        // Prefer explicit JDBC URL if provided.
        String explicitJdbc = firstNonBlank(
                envOrProperty(environment, "SPRING_DATASOURCE_URL"),
                envOrProperty(environment, "DB_URL"),
                envOrProperty(environment, "JDBC_DATABASE_URL")
        );

        String raw = explicitJdbc;
        if (raw == null) {
            raw = envOrProperty(environment, "DATABASE_URL");
        }

        raw = resolveIndirect(raw, environment);
        if (raw == null) {
            throw new IllegalStateException("No database URL provided. Set DB_URL (jdbc:...) or DATABASE_URL (postgres://... / mysql://...).");
        }

        ParsedUrl parsed = parseUrl(raw);
        if (parsed == null || parsed.jdbcUrl == null || !parsed.jdbcUrl.startsWith("jdbc:")) {
            throw new IllegalStateException("Database URL must be a valid jdbc:* URL or a supported non-jdbc URL (postgres://, mysql://, mariadb://)");
        }

        String username = firstNonBlank(
                envOrProperty(environment, "SPRING_DATASOURCE_USERNAME"),
                envOrProperty(environment, "DB_USER"),
                envOrProperty(environment, "JDBC_DATABASE_USERNAME")
        );
        if (username == null) {
            username = parsed.username;
        }

        String password = firstNonBlank(
                envOrProperty(environment, "SPRING_DATASOURCE_PASSWORD"),
                envOrProperty(environment, "DB_PASS"),
                envOrProperty(environment, "JDBC_DATABASE_PASSWORD")
        );
        if (password == null) {
            password = parsed.password;
        }

        return new ResolvedDb(parsed.jdbcUrl, username, password);
    }

    private static String envOrProperty(Environment environment, String key) {
        String value = trimToNull(System.getenv(key));
        if (value != null) {
            return value;
        }

        value = trimToNull(environment.getProperty(key));
        if (value != null) {
            return value;
        }

        // Try relaxed name variant (DATABASE_URL -> database.url)
        String relaxed = key.toLowerCase(Locale.ROOT).replace('_', '.');
        return trimToNull(environment.getProperty(relaxed));
    }

    private static String resolveIndirect(String raw, Environment environment) {
        String trimmed = trimToNull(raw);
        if (trimmed == null) {
            return null;
        }

        // If someone set DB_URL literally to "${DATABASE_URL}" in Render.
        if (trimmed.startsWith("${") && trimmed.endsWith("}")) {
            String key = trimToNull(trimmed.substring(2, trimmed.length() - 1));
            if (key == null) {
                return trimmed;
            }

            String resolved = trimToNull(System.getenv(key));
            if (resolved != null) {
                return resolved;
            }

            resolved = trimToNull(environment.getProperty(key));
            if (resolved != null) {
                return resolved;
            }

            String relaxed = key.toLowerCase(Locale.ROOT).replace('_', '.');
            resolved = trimToNull(environment.getProperty(relaxed));
            return resolved != null ? resolved : trimmed;
        }

        return trimmed;
    }

    private static ParsedUrl parseUrl(String rawUrl) {
        String trimmed = rawUrl.trim();
        if (trimmed.startsWith("jdbc:")) {
            return new ParsedUrl(trimmed, null, null);
        }

        URI uri;
        try {
            uri = new URI(trimmed);
        } catch (URISyntaxException ex) {
            return null;
        }

        String scheme = trimToNull(uri.getScheme());
        if (scheme == null) {
            return null;
        }

        String driver = switch (scheme.toLowerCase(Locale.ROOT)) {
            case "postgres", "postgresql" -> "postgresql";
            case "mysql" -> "mysql";
            case "mariadb" -> "mariadb";
            default -> null;
        };
        if (driver == null) {
            return null;
        }

        String host = trimToNull(uri.getHost());
        if (host == null) {
            return null;
        }

        StringBuilder jdbc = new StringBuilder();
        jdbc.append("jdbc:").append(driver).append("://").append(host);
        if (uri.getPort() > 0) {
            jdbc.append(":").append(uri.getPort());
        }

        String path = uri.getRawPath();
        if (path != null && !path.isBlank()) {
            jdbc.append(path);
        }

        String query = trimToNull(uri.getRawQuery());
        if (query != null) {
            // MySQL Connector/J uses sslMode (camelCase). Some providers use ssl-mode.
            String normalizedQuery = query.replace("ssl-mode=", "sslMode=");
            jdbc.append("?").append(normalizedQuery);
        }

        String username = null;
        String password = null;
        String userInfo = trimToNull(uri.getUserInfo());
        if (userInfo != null) {
            int colon = userInfo.indexOf(':');
            if (colon >= 0) {
                username = userInfo.substring(0, colon);
                password = userInfo.substring(colon + 1);
            } else {
                username = userInfo;
            }
        }

        return new ParsedUrl(jdbc.toString(), username, password);
    }

    private static String firstNonBlank(String... values) {
        if (values == null) {
            return null;
        }
        for (String value : values) {
            String trimmed = trimToNull(value);
            if (trimmed != null) {
                return trimmed;
            }
        }
        return null;
    }

    private static String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private record ParsedUrl(String jdbcUrl, String username, String password) {
    }

    private record ResolvedDb(String jdbcUrl, String username, String password) {
    }
}
