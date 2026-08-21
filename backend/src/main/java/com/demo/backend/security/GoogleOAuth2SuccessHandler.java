package com.demo.backend.security;

import com.demo.backend.config.GoogleOAuthProperties;
import com.demo.backend.dto.response.AuthResponse;
import com.demo.backend.service.AuthService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriUtils;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

@Slf4j
@Component
@RequiredArgsConstructor
public class GoogleOAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final AuthService authService;
    private final GoogleOAuthProperties googleOAuthProperties;

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) throws IOException, ServletException {
        try {
            OAuth2User googleUser = (OAuth2User) authentication.getPrincipal();
            if (!isEmailVerified(googleUser)) {
                redirectToLoginError(response, "google_email_not_verified");
                return;
            }

            AuthResponse authResponse = authService.loginWithGoogle(
                    googleUser.getAttribute("email"),
                    googleUser.getAttribute("name"),
                    googleUser.getAttribute("picture")
            );

            String fragment = "accessToken=" + encode(authResponse.getAccessToken())
                    + "&refreshToken=" + encode(authResponse.getRefreshToken());
            response.sendRedirect(googleOAuthProperties.getFrontendUrl() + "/oauth2/callback#" + fragment);
        } catch (Exception ex) {
            log.error("Google OAuth login failed", ex);
            redirectToLoginError(response, "google_login_failed");
        }
    }

    private boolean isEmailVerified(OAuth2User googleUser) {
        Object emailVerified = googleUser.getAttribute("email_verified");
        return Boolean.TRUE.equals(emailVerified)
                || "true".equalsIgnoreCase(String.valueOf(emailVerified));
    }

    private String encode(String value) {
        return UriUtils.encodeQueryParam(value, StandardCharsets.UTF_8);
    }

    private void redirectToLoginError(HttpServletResponse response, String error) throws IOException {
        response.sendRedirect(googleOAuthProperties.getFrontendUrl() + "/login?oauthError=" + error);
    }
}
