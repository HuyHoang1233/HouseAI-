package com.demo.backend.config;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.oauth2.client.CommonOAuth2Provider;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.registration.InMemoryClientRegistrationRepository;

@Configuration
@RequiredArgsConstructor
@ConditionalOnProperty(prefix = "app.google-oauth", name = "enabled", havingValue = "true")
public class GoogleOAuth2Config {

    private final GoogleOAuthProperties googleOAuthProperties;

    @Bean
    public ClientRegistrationRepository clientRegistrationRepository() {
        if (!googleOAuthProperties.isConfigured()) {
            throw new IllegalStateException(
                    "Google OAuth được bật nhưng thiếu APP_GOOGLE_OAUTH_CLIENT_ID hoặc APP_GOOGLE_OAUTH_CLIENT_SECRET."
            );
        }

        ClientRegistration google = CommonOAuth2Provider.GOOGLE
                .getBuilder("google")
                .clientId(googleOAuthProperties.getClientId())
                .clientSecret(googleOAuthProperties.getClientSecret())
                .scope("openid", "profile", "email")
                .redirectUri("{baseUrl}/login/oauth2/code/{registrationId}")
                .build();

        return new InMemoryClientRegistrationRepository(google);
    }
}
