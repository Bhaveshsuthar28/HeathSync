package com.Heath.Backend.Config;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.Ordered;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;

public class DatabaseUrlEnvironmentPostProcessor implements EnvironmentPostProcessor, Ordered {

    private static final String PROPERTY_SOURCE_NAME = "databaseUrlEnvironmentPostProcessor";

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        String existingUrl = trimToNull(environment.getProperty("spring.datasource.url"));
        if (existingUrl != null && existingUrl.startsWith("jdbc:")) {
            return;
        }

        String rawUrl = firstNonBlank(
                environment,
                "DB_URL",
                "SPRING_DATASOURCE_URL",
                "JDBC_DATABASE_URL",
                "DATABASE_URL"
        );
        if (rawUrl == null) {
            return;
        }

        ParsedUrl parsedUrl = parseNonJdbcUrl(rawUrl);
        if (parsedUrl == null) {
            return;
        }

        Map<String, Object> overrides = new LinkedHashMap<>();

        if (existingUrl == null || !existingUrl.startsWith("jdbc:")) {
            overrides.put("spring.datasource.url", parsedUrl.jdbcUrl);
        }

        if (trimToNull(environment.getProperty("spring.datasource.username")) == null) {
            String username = firstNonBlank(environment, "DB_USER");
            if (username == null) {
                username = parsedUrl.username;
            }
            if (username != null) {
                overrides.put("spring.datasource.username", username);
            }
        }

        if (trimToNull(environment.getProperty("spring.datasource.password")) == null) {
            String password = firstNonBlank(environment, "DB_PASS");
            if (password == null) {
                password = parsedUrl.password;
            }
            if (password != null) {
                overrides.put("spring.datasource.password", password);
            }
        }

        if (!overrides.isEmpty()) {
            environment.getPropertySources().addFirst(new MapPropertySource(PROPERTY_SOURCE_NAME, overrides));
        }
    }

    @Override
    public int getOrder() {
        // Run late so other property sources (e.g., spring-dotenv loading .env)
        // have already populated DB_URL / DATABASE_URL, etc.
        return Ordered.LOWEST_PRECEDENCE;
    }

    private static String firstNonBlank(ConfigurableEnvironment environment, String... keys) {
        for (String key : keys) {
            if (key == null) {
                continue;
            }
            String value = trimToNull(environment.getProperty(key));
            if (value != null) {
                return value;
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

    private static ParsedUrl parseNonJdbcUrl(String rawUrl) {
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

    private record ParsedUrl(String jdbcUrl, String username, String password) {
    }
}
