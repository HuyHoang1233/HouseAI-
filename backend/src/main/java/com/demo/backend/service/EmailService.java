package com.demo.backend.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendOtpEmail(String to, String otp) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject("Mã xác nhận khôi phục mật khẩu (OTP)");
            message.setText("Mã xác nhận của bạn là: " + otp + "\n\nMã này sẽ hết hạn trong vòng 5 phút.\nVui lòng không chia sẻ mã này cho bất kỳ ai.");
            
            mailSender.send(message);
            log.info("OTP email sent successfully to: {}", to);
        } catch (Exception e) {
            log.error("Failed to send OTP email to {}: {}", to, e.getMessage());
            // In a real app we might throw a custom exception here
        }
    }
}
