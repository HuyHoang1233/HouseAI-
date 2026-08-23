package com.demo.backend.service;

import com.demo.backend.dto.request.LoginRequest;
import com.demo.backend.dto.request.RegisterRequest;
import com.demo.backend.dto.response.AuthResponse;
import com.demo.backend.dto.response.UserResponse;
import com.demo.backend.entity.User;
import com.demo.backend.exception.BadRequestException;
import com.demo.backend.exception.ResourceNotFoundException;
import com.demo.backend.repository.UserRepository;
import com.demo.backend.security.CustomUserDetailsService;
import com.demo.backend.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final EmailService emailService;
    private final OtpService otpService;
    private final CustomUserDetailsService userDetailsService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = normalizeEmail(request.getEmail());
        validateEmailDomain(email);

        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException("Username is already taken");
        }
        if (userRepository.existsByEmail(email)) {
            throw new BadRequestException("Email is already registered");
        }

        User user = User.builder()
                .username(request.getUsername())
                .email(email)
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .roles(Set.of(User.Role.ROLE_USER))
                .build();

        userRepository.save(user);
        log.info("User registered successfully: {}", user.getUsername());

        // Auto-login after registration
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);

        return buildAuthResponse(authentication, user);
    }

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", request.getUsername()));

        log.info("User logged in: {}", user.getUsername());
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

    public void sendOtp(String email) {
        String normalizedEmail = normalizeEmail(email);
        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", normalizedEmail));

        String otp = otpService.generateOtp(normalizedEmail);
        emailService.sendOtpEmail(normalizedEmail, otp);
    }

    public boolean verifyOtp(String email, String otp) {
        return otpService.validateOtp(normalizeEmail(email), otp);
    }

    @Transactional
    public void resetPassword(String email, String otp, String newPassword) {
        String normalizedEmail = normalizeEmail(email);

        if (!otpService.validateOtp(normalizedEmail, otp)) {
            throw new BadRequestException("Mã OTP không hợp lệ hoặc đã hết hạn");
        }

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", normalizedEmail));

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        otpService.clearOtp(normalizedEmail);
        
        log.info("Password reset successfully for user email: {}", normalizedEmail);
    }

    private String normalizeEmail(String email) {
        return email == null ? null : email.trim().toLowerCase(Locale.ROOT);
    }

    private void validateEmailDomain(String email) {
        if (email != null && email.endsWith("@gmai.com")) {
            throw new BadRequestException("Tên miền gmai.com có vẻ bị thiếu chữ 'l'. Vui lòng dùng gmail.com.");
        }
    }

}
