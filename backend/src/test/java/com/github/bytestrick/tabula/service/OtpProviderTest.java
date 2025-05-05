package com.github.bytestrick.tabula.service;

import com.github.bytestrick.tabula.exception.InvalidOtpException;
import com.github.bytestrick.tabula.model.User;
import com.github.bytestrick.tabula.repository.UserDao;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import java.time.LocalDateTime;
import java.util.Objects;
import java.util.Optional;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
import static org.assertj.core.api.AssertionsForClassTypes.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@SpringBootTest
public class OtpProviderTest {
    private static final String EMAIL = "test@example.com";
    @MockitoBean
    private JavaMailSender javaMailSender;

    @MockitoBean
    private UserDao userDao;

    @Autowired
    private OtpProvider otpProvider;

    @Test
    void createGeneratesSetsAndIssuesANewOtpForAUser() {
        User user = User.builder().email(EMAIL).build();
        otpProvider.send(user, user.getEmail(), "this is a reason");

        assertThat(user.getOtp()).isNotNull().hasSize(6);
        assertThat(user.getOtpExpiration()).isNotNull();

        verify(javaMailSender).send(argThat((SimpleMailMessage email) ->
                Objects.requireNonNull(email.getTo())[0].equals(user.getEmail())
                        && Objects.requireNonNull(email.getSubject()).contains("this is a reason")));
    }

    @Test
    void verifySucceedsOnAValidOtp() {
        String otp = "123456";
        User user = User.builder().email(EMAIL).otp(otp).otpExpiration(LocalDateTime.now().plusMinutes(30)).build();
        when(userDao.findByEmail(EMAIL)).thenReturn(Optional.of(user));
        assertThat(otpProvider.verify(EMAIL, otp)).isEqualTo(Optional.of(user));
    }

    @Test
    void verifyShouldThrowWhenTheOtpIsInvalid() {
        String otp = "123456";
        User user = User.builder()
                .email(EMAIL)
                .otp(otp)
                .otpExpiration(LocalDateTime.now().plusMinutes(30))
                .build();
        when(userDao.findByEmail(EMAIL)).thenReturn(Optional.of(user));

        assertThatThrownBy(() -> otpProvider.verify(EMAIL, "654321"))
                .isInstanceOf(InvalidOtpException.class)
                .hasMessage("Incorrect");

        user.setOtpExpiration(LocalDateTime.now());
        assertThatThrownBy(() -> otpProvider.verify(EMAIL, otp))
                .isInstanceOf(InvalidOtpException.class)
                .hasMessage("Expired");

        user.setOtp(null);
        user.setOtpExpiration(null);
        assertThatThrownBy(() -> otpProvider.verify(EMAIL, otp))
                .isInstanceOf(InvalidOtpException.class)
                .hasMessage("Not found");
    }
}
