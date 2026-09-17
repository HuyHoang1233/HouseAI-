package com.demo.backend.service;

import com.demo.backend.dto.response.AuthResponse;
import com.demo.backend.entity.User;
import com.demo.backend.exception.BadRequestException;
import com.demo.backend.repository.UserRepository;
import com.demo.backend.security.CustomUserDetailsService;
import com.demo.backend.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class OAuth2Service {

    private final UserRepository userRepository;
    private final CustomUserDetailsService userDetailsService;
    private final JwtTokenProvider tokenProvider;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public AuthResponse loginWithGoogle(String email, String fullName, String avatarUrl) {
        String normalizedEmail = normalizeEmail(email);
        if (normalizedEmail == null || normalizedEmail.isBlank()) {
            throw new BadRequestException("Google không cung cấp địa chỉ email hợp lệ.");
        }

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseGet(() -> createGoogleUser(normalizedEmail, fullName, avatarUrl));

        if (!user.getActive()) {
            throw new BadRequestException("Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.");
        }

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getUsername());
        Authentication authentication = new UsernamePasswordAuthenticationToken(
                userDetails,
                null,
                userDetails.getAuthorities()
        );

        log.info("User logged in with Google: {}", user.getUsername());
        return buildAuthResponse(authentication, user);
    }

    private AuthResponse buildAuthResponse(Authentication authentication, User user) {
        String accessToken = tokenProvider.generateAccessToken(authentication);
        String refreshToken = tokenProvider.generateRefreshToken(authentication);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .userId(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .roles(user.getRoles().stream()
                        .map(Enum::name)
                        .collect(Collectors.toSet()))
                .build();
    }

    private String normalizeEmail(String email) {
        return email == null ? null : email.trim().toLowerCase(Locale.ROOT);
    }

    private User createGoogleUser(String email, String fullName, String avatarUrl) {
        String username = createGoogleUsername(email);
        User user = User.builder()
                .username(username)
                .email(email)
                .password(passwordEncoder.encode(UUID.randomUUID().toString()))
                .fullName(fullName)
                .avatarUrl(avatarUrl)
                .roles(Set.of(User.Role.ROLE_USER))
                .build();

        User savedUser = userRepository.save(user);
        log.info("Created account from Google login: {}", savedUser.getUsername());
        return savedUser;
    }

    private String createGoogleUsername(String email) {
        String localPart = email.substring(0, email.indexOf('@'))
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9._-]", "-");
        String base = "google_" + (localPart.isBlank() ? "user" : localPart);
        base = base.substring(0, Math.min(base.length(), 44));

        String candidate = base;
        int suffix = 2;
        while (userRepository.existsByUsername(candidate)) {
            String suffixText = "_" + suffix++;
            candidate = base.substring(0, Math.min(base.length(), 50 - suffixText.length())) + suffixText;
        }
        return candidate;
    }
}
