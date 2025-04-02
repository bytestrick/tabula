package com.github.bytestrick.tabula.service;

import com.github.bytestrick.tabula.exception.InvalidOtpException;
import com.github.bytestrick.tabula.model.User;
import com.github.bytestrick.tabula.repository.UserDao;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

@Slf4j
@Service
public class OtpProvider {
    private static final Random RANDOM = new Random();
    private final JavaMailSender javaMailSender;
    private final UserDao userDao;

    public OtpProvider(JavaMailSender javaMailSender, UserDao userDao) {
        this.javaMailSender = javaMailSender;
        this.userDao = userDao;
    }

    /**
     * Generate and send an otp for a user
     *
     * @param user   the generated OTP is set on it
     * @param reason the reason for the OTP
     */
    public void sendOtp(User user, String reason) {
        String otp = String.valueOf(RANDOM.nextInt(100000, 999999));
        int expirationMinutes = 30;
        user.setOtp(otp);
        user.setOtpExpiration(LocalDateTime.now().plusMinutes(expirationMinutes));

        SimpleMailMessage mail = new SimpleMailMessage();
        mail.setTo(user.getEmail());
        mail.setSubject("Tabula: " + reason);
        mail.setText(String.format(
                "Use this code to %s: %s\n\nIt will expire in %d minutes.", reason, otp, expirationMinutes));
        javaMailSender.send(mail);
        log.info("OTP sent to {}", user.getEmail());
    }

    public Optional<User> verifyOtp(String email, String otp) throws InvalidOtpException {
        return userDao.findByEmail(email).map(user -> {
            if (user.getOtpExpiration() == null || user.getOtp() == null) {
                throw new InvalidOtpException("Not found");
            }

            if (user.getOtpExpiration().isAfter(LocalDateTime.now())) {
                throw new InvalidOtpException("Expired");
            }

            if (user.getOtp().equals(otp)) {
                return user;
            }
            throw new InvalidOtpException("Incorrect");
        });
    }

    /**
     * The reason for the OTP
     */
    @AllArgsConstructor
    @Getter
    public enum Reason {
        VERIFY_EMAIL("verify your email"),
        RESET_PASSWORD("reset your password");

        private final String reason;

        public Reason fromString(String reason) {
            for (Reason r : Reason.values()) {
                if (r.getReason().equals(reason)) {
                    return r;
                }
            }
            throw new IllegalArgumentException("Invalid reason: " + reason);
        }
    }
}
