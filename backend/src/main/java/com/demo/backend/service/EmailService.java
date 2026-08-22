package com.demo.backend.service;

import jakarta.mail.internet.MimeMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendOtpEmail(String to, String otp) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom("hoangchanelqbvn@gmail.com", "Sơn Nano");
            helper.setTo(to);
            helper.setSubject("Mã xác nhận khôi phục mật khẩu (OTP)");
            
            String htmlMsg = "<div style=\"font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px 20px; background-color: #f4f7f6;\">"
                    + "<div style=\"background-color: #ffffff; padding: 40px; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); text-align: center; border-top: 6px solid #e8702a;\">"
                    + "<div style=\"margin-bottom: 25px;\">"
                    + "<h1 style=\"color: #e8702a; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;\">SƠN NANO</h1>"
                    + "</div>"
                    + "<h2 style=\"color: #1e293b; margin-top: 0; font-size: 22px;\">Khôi phục mật khẩu</h2>"
                    + "<p style=\"color: #64748b; font-size: 16px; line-height: 1.6; margin-bottom: 30px;\">Xin chào,<br>Bạn vừa yêu cầu đặt lại mật khẩu. Vui lòng sử dụng mã xác nhận gồm 6 chữ số dưới đây để hoàn tất quá trình:</p>"
                    + "<div style=\"margin: 35px 0;\">"
                    + "<span style=\"display: inline-block; font-size: 36px; font-weight: bold; letter-spacing: 12px; color: #e8702a; background-color: #fff7f2; padding: 20px 30px; border-radius: 12px; border: 2px dashed #fdba74; box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);\">" + otp + "</span>"
                    + "</div>"
                    + "<p style=\"color: #ef4444; font-size: 15px; font-weight: 500; margin-bottom: 5px;\">⏰ Mã xác nhận này sẽ hết hạn trong vòng 5 phút.</p>"
                    + "<p style=\"color: #94a3b8; font-size: 14px; margin-top: 25px; line-height: 1.5;\">Nếu bạn không yêu cầu đổi mật khẩu, vui lòng bỏ qua email này hoặc liên hệ với bộ phận hỗ trợ để bảo vệ tài khoản.</p>"
                    + "</div>"
                    + "<div style=\"text-align: center; margin-top: 25px; color: #94a3b8; font-size: 13px;\">"
                    + "&copy; 2026 Sơn Nano. All rights reserved."
                    + "</div>"
                    + "</div>";

            helper.setText(htmlMsg, true);
            
            mailSender.send(message);
            log.info("HTML OTP email sent successfully to: {}", to);
        } catch (Exception e) {
            log.error("Failed to send OTP email to {}: {}", to, e.getMessage());
        }
    }
}
