package com.github.bytestrick.tabula.service;

import com.github.bytestrick.tabula.exception.InvalidOtpException;
import com.github.bytestrick.tabula.model.User;
import com.github.bytestrick.tabula.repository.UserDao;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

@Slf4j
@Service
@RequiredArgsConstructor
public class OtpProvider {
    private static final Random RANDOM = new Random();
    private final JavaMailSender javaMailSender;
    private final UserDao userDao;

    /**
     * Generate and send an otp for a user
     *
     * @param user   the generated OTP is set on it
     * @param reason the reason for the OTP
     */
    public void send(User user, String reason) {
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

    public Optional<User> verify(String email, String otp) throws InvalidOtpException {
        return userDao.findByEmail(email).map(user -> {
            LocalDateTime expiration = user.getOtpExpiration(), now = LocalDateTime.now();
            String actualOtp = user.getOtp();
            if (expiration == null || actualOtp == null) {
                throw new InvalidOtpException("Not found");
            }
            if (now.isAfter(expiration)) {
                throw new InvalidOtpException("Expired");
            }
            if (otp.equals(actualOtp)) {
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
    }
}
