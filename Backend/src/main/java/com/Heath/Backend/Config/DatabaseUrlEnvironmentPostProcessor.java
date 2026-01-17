package com.Heath.Backend.Config;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.Ordered;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;

public class DatabaseUrlEnvironmentPostProcessor implements EnvironmentPostProcessor, Ordered {

    private static final String PROPERTY_SOURCE_NAME = "databaseUrlEnvironmentPostProcessor";
    private static final Logger log = LoggerFactory.getLogger(DatabaseUrlEnvironmentPostProcessor.class);

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        String existingUrl = effectiveValue(environment.getProperty("spring.datasource.url"));
        if (existingUrl != null && existingUrl.startsWith("jdbc:")) {
            return;
        }

        if (existingUrl != null) {
            log.debug("spring.datasource.url is present but not jdbc:* (will attempt normalization)");
        }

        String rawUrl = null;
        String rawUrlKey = null;
        String[] candidates = new String[] {
                "DB_URL",
                "SPRING_DATASOURCE_URL",
                "JDBC_DATABASE_URL",
                "DATABASE_URL"
        };
        for (String candidate : candidates) {
            String value = firstNonBlankProperty(environment, candidate);
            if (value != null) {
                rawUrl = value;
                rawUrlKey = candidate;
                break;
            }
        }

        rawUrl = resolveIndirectEnvValue(environment, rawUrl);
        if (rawUrl == null) {
            return;
        }

        log.debug("DB URL candidate found via {} (startsWithJdbc={})", rawUrlKey, rawUrl.startsWith("jdbc:"));

        ParsedUrl parsedUrl = parseNonJdbcUrl(rawUrl);
        if (parsedUrl == null) {
            log.debug("DB URL candidate could not be parsed/normalized (key={})", rawUrlKey);
            return;
        }

        Map<String, Object> overrides = new LinkedHashMap<>();

        if (existingUrl == null || !existingUrl.startsWith("jdbc:")) {
            overrides.put("spring.datasource.url", parsedUrl.jdbcUrl);
        }

        if (effectiveValue(environment.getProperty("spring.datasource.username")) == null) {
            String username = firstNonBlank(environment, "DB_USER");
            if (username == null) {
                username = parsedUrl.username;
            }
            if (username != null) {
                overrides.put("spring.datasource.username", username);
            }
        }

        if (effectiveValue(environment.getProperty("spring.datasource.password")) == null) {
            String password = firstNonBlank(environment, "DB_PASS");
            if (password == null) {
                password = parsedUrl.password;
            }
            if (password != null) {
                overrides.put("spring.datasource.password", password);
            }
        }

        if (!overrides.isEmpty()) {
            if (overrides.containsKey("spring.datasource.url")) {
                log.debug("Normalized datasource URL (key={})", rawUrlKey);
            }
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
            String value = firstNonBlankProperty(environment, key);
            if (value != null) {
                return value;
            }
        }
        return null;
    }

    private static String firstNonBlankProperty(ConfigurableEnvironment environment, String key) {
        if (key == null) {
            return null;
        }

        // Try several common variants because environment sources (and spring-dotenv)
        // may expose env vars under relaxed names (e.g., DATABASE_URL -> database.url).
        String[] candidates = new String[] {
                key,
                key.toLowerCase(Locale.ROOT),
                key.replace('_', '.'),
                key.replace('_', '.').toLowerCase(Locale.ROOT),
                key.replace('.', '_'),
                key.replace('.', '_').toUpperCase(Locale.ROOT)
        };

        for (String candidate : candidates) {
            String value = trimToNull(environment.getProperty(candidate));
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

    private static boolean isPlaceholderValue(String value) {
        if (value == null) {
            return false;
        }
        String trimmed = value.trim();
        return trimmed.startsWith("${") && trimmed.endsWith("}");
    }

    /**
     * Treat Spring placeholder strings like "${DB_URL}" as effectively unset.
     * This allows the post-processor to provide a real value from Render-style env vars.
     */
    private static String effectiveValue(String value) {
        String trimmed = trimToNull(value);
        if (trimmed == null) {
            return null;
        }
        return isPlaceholderValue(trimmed) ? null : trimmed;
    }

    /**
     * Render users sometimes set DB_URL to "${DATABASE_URL}" (as a literal string).
     * If a value looks like an env placeholder or key name, attempt to resolve it.
     */
    private static String resolveIndirectEnvValue(ConfigurableEnvironment environment, String rawValue) {
        String trimmed = trimToNull(rawValue);
        if (trimmed == null) {
            return null;
        }

        // Pattern: ${SOME_KEY}
        if (trimmed.startsWith("${") && trimmed.endsWith("}")) {
            String key = trimToNull(trimmed.substring(2, trimmed.length() - 1));
            if (key != null) {
                String resolved = firstNonBlankProperty(environment, key);
                if (resolved != null) {
                    return resolved;
                }
            }
            return trimmed;
        }

        // Pattern: SOME_KEY (e.g. "DATABASE_URL")
        if (trimmed.matches("[A-Z0-9_]+")) {
            String resolved = firstNonBlankProperty(environment, trimmed);
            if (resolved != null) {
                return resolved;
            }
        }

        return trimmed;
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
