package com.demo.backend.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "app.google-oauth")
public class GoogleOAuthProperties {

    private boolean enabled;
    private String clientId;
    private String clientSecret;
    private String frontendUrl = "http://localhost:3000";

    public boolean isConfigured() {
        return enabled
                && clientId != null && !clientId.isBlank()
                && clientSecret != null && !clientSecret.isBlank();
    }
}
