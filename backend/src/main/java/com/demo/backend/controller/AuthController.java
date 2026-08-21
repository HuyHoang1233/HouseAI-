package com.demo.backend.controller;

import com.demo.backend.config.GoogleOAuthProperties;
import com.demo.backend.dto.request.ForgotPasswordRequest;
import com.demo.backend.dto.request.LoginRequest;
import com.demo.backend.dto.request.RegisterRequest;
import com.demo.backend.dto.request.ResetPasswordRequest;
import com.demo.backend.dto.request.VerifyOtpRequest;
import com.demo.backend.dto.response.ApiResponse;
import com.demo.backend.dto.response.AuthResponse;
import com.demo.backend.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Authentication API")
public class AuthController {

    private final AuthService authService;
    private final GoogleOAuthProperties googleOAuthProperties;

    @PostMapping("/register")
    @Operation(summary = "Register a new user")
    public ResponseEntity<ApiResponse<AuthResponse>> register(
            @Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(response));
    }

    @PostMapping("/login")
    @Operation(summary = "Login with username and password")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @GetMapping("/oauth2/google/status")
    @Operation(summary = "Check whether Google login is configured")
    public ResponseEntity<ApiResponse<Boolean>> getGoogleLoginStatus() {
        return ResponseEntity.ok(ApiResponse.success(googleOAuthProperties.isConfigured()));
    }

    @PostMapping("/forgot-password/send-otp")
    @Operation(summary = "Send OTP for password recovery")
    public ResponseEntity<ApiResponse<String>> sendOtp(
            @Valid @RequestBody ForgotPasswordRequest request) {
        authService.sendOtp(request.getEmail());
        return ResponseEntity.ok(ApiResponse.success("Mã OTP đã được gửi đến email của bạn.", null));
    }

    @PostMapping("/forgot-password/verify-otp")
    @Operation(summary = "Verify OTP")
    public ResponseEntity<ApiResponse<Boolean>> verifyOtp(
            @Valid @RequestBody VerifyOtpRequest request) {
        boolean isValid = authService.verifyOtp(request.getEmail(), request.getOtp());
        if (isValid) {
            return ResponseEntity.ok(ApiResponse.success("Mã OTP hợp lệ.", true));
        } else {
            return ResponseEntity.badRequest().body(ApiResponse.error(400, "Mã OTP không hợp lệ hoặc đã hết hạn."));
        }
    }

    @PostMapping("/forgot-password/reset")
    @Operation(summary = "Reset password using OTP")
    public ResponseEntity<ApiResponse<String>> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request.getEmail(), request.getOtp(), request.getNewPassword());
        return ResponseEntity.ok(ApiResponse.success("Đổi mật khẩu thành công.", null));
    }
}
