package com.demo.backend.service;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OtpService {

    // Store OTP and its expiration time
    private final Map<String, OtpData> otpCache = new ConcurrentHashMap<>();
    private static final int OTP_VALID_DURATION = 5; // 5 minutes

    public String generateOtp(String email) {
        String otp = String.format("%06d", new Random().nextInt(999999));
        OtpData otpData = new OtpData(otp, LocalDateTime.now().plusMinutes(OTP_VALID_DURATION));
        otpCache.put(email, otpData);
        return otp;
    }

    public boolean validateOtp(String email, String otp) {
        OtpData otpData = otpCache.get(email);
        if (otpData == null) {
            return false;
        }
        
        if (otpData.getExpirationTime().isBefore(LocalDateTime.now())) {
            otpCache.remove(email);
            return false;
        }

        if (otpData.getOtp().equals(otp)) {
            // Can choose to remove or keep it until password is actually reset.
            // Best practice is to issue a reset token, but for simplicity, we keep it 
            // valid or just let the reset step also verify the OTP or a reset token.
            return true;
        }
        
        return false;
    }
    
    public void clearOtp(String email) {
        otpCache.remove(email);
    }

    private static class OtpData {
        private final String otp;
        private final LocalDateTime expirationTime;

        public OtpData(String otp, LocalDateTime expirationTime) {
            this.otp = otp;
            this.expirationTime = expirationTime;
        }

        public String getOtp() {
            return otp;
        }

        public LocalDateTime getExpirationTime() {
            return expirationTime;
        }
    }
}
