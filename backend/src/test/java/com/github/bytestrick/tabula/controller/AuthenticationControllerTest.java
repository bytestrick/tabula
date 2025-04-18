package com.github.bytestrick.tabula.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.github.bytestrick.tabula.controller.dto.*;
import com.github.bytestrick.tabula.exception.InvalidOtpException;
import com.github.bytestrick.tabula.model.Country;
import com.github.bytestrick.tabula.model.User;
import com.github.bytestrick.tabula.repository.UserDao;
import com.github.bytestrick.tabula.service.DaoUserDetailsService;
import com.github.bytestrick.tabula.service.JwtProvider;
import com.github.bytestrick.tabula.service.OtpProvider;
import jakarta.annotation.PostConstruct;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentMatchers;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class AuthenticationControllerTest {
    private static final String email = "test@example.com";
    private static final ObjectMapper objectMapper = new ObjectMapper();
    private static final SignInRequest signInRequest = new SignInRequest(email, "LinenFabrication9!", false);
    private UserDetails userDetails;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private MockMvc mockMvc;
    @MockitoBean
    private UserDao userDao;
    @MockitoBean
    private OtpProvider otpProvider;
    @MockitoBean
    private JwtProvider jwtProvider;
    @MockitoBean
    private DaoUserDetailsService daoUserDetailsService;

    @PostConstruct
    void init() {
        userDetails = new org.springframework.security.core.userdetails.User(
                signInRequest.email(),
                passwordEncoder.encode(signInRequest.password()),
                List.of(new SimpleGrantedAuthority("USER"))
        );
    }

    @Test
    void signInShouldAuthenticateAnExistingEnabledUser() throws Exception {
        when(daoUserDetailsService.loadUserByUsername(email)).thenReturn(userDetails);
        when(userDao.findByEmail(signInRequest.email()))
                .thenReturn(Optional.of(User.builder()
                        .email(signInRequest.email())
                        .enabled(true)
                        .encodedPassword(passwordEncoder.encode(signInRequest.password()))
                        .roles(List.of(new SimpleGrantedAuthority("USER")))
                        .build()));

        mockMvc.perform(post("/auth/sign-in")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(signInRequest)))
                .andExpect(status().isOk());

        verify(jwtProvider).create(Map.of(), email, Duration.ZERO, Duration.ofHours(24));
    }

    @Test
    void signInShouldReturnAnErrorWhenTheUserDoesNotExist() throws Exception {
        when(daoUserDetailsService.loadUserByUsername(email)).thenReturn(userDetails);
        when(userDao.findByEmail(signInRequest.email())).thenReturn(Optional.empty());

        mockMvc.perform(post("/auth/sign-in")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(signInRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("No user found with this email"));
    }

    @Test
    void signInShouldReturnAnErrorWhenAnAttemptToAuthenticateAUserThatIsNotEnabledIsMade() throws Exception {
        when(userDao.findByEmail(signInRequest.email()))
                .thenReturn(Optional.of(User.builder()
                        .email(signInRequest.email())
                        .enabled(false)
                        .encodedPassword(passwordEncoder.encode(signInRequest.password()))
                        .build()));

        mockMvc.perform(post("/auth/sign-in")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(signInRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Not enabled"));
    }

    @Test
    void signInShouldReturnAnErrorWhenThePasswordIsIncorrect() throws Exception {
        when(daoUserDetailsService.loadUserByUsername(email)).thenReturn(userDetails);
        when(userDao.findByEmail(signInRequest.email()))
                .thenReturn(Optional.of(User.builder()
                        .email(signInRequest.email())
                        .enabled(true)
                        .encodedPassword(passwordEncoder.encode(signInRequest.password()))
                        .roles(List.of(new SimpleGrantedAuthority("USER")))
                        .build()));

        mockMvc.perform(post("/auth/sign-in")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new SignInRequest(signInRequest.email(), "NefariousMeans9!", false))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Incorrect password"));
    }

    @Test
    void signUpShouldRegisterANewUser() throws Exception {
        when(userDao.findByEmail(signInRequest.email())).thenReturn(Optional.empty());

        mockMvc.perform(post("/auth/sign-up")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new SignUpRequest("test@example.com", "John", "Doe", "NefariousMeans9!", false,
                                        new Country("Italy", "🇮🇹", "IT", 39)))))
                .andExpect(status().isOk());

        verify(userDao).save(ArgumentMatchers.argThat(user -> user.getEmail().equals("test@example.com")
                && passwordEncoder.matches("NefariousMeans9!", user.getEncodedPassword())));
    }

    @Test
    void signUpShouldReturnAnErrorWhenTheEmailIsAlreadyRegistered() throws Exception {
        when(userDao.findByEmail(signInRequest.email())).thenReturn(Optional.of(User.builder().build()));

        mockMvc.perform(post("/auth/sign-up")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new SignUpRequest("test@example.com", "John", "Doe", "NefariousMeans9!", false,
                                        new Country("Italy", "🇮🇹", "IT", 39)))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Email already registered"));
    }

    @Test
    void verifyEmailOtpSucceeds() throws Exception {
        String email = "test@example.com";
        String otp = "123456";
        when(otpProvider.verify(email, otp)).thenReturn(Optional.of(User.builder().email(email).otp(otp).build()));

        mockMvc.perform(post("/auth/verify-email-otp")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new VerifyOtpRequest(email, otp))))
                .andExpect(status().isOk());

        verify(userDao).updateEmailVerification(ArgumentMatchers.argThat(user ->
                user.getEmail().equals(email) && user.getOtp() == null && user.isEnabled()));
    }

    @Test
    void verifyEmailOtpReturnsAnErrorIfTheOtpIsInvalid() throws Exception {
        String email = "test@example.com";
        String otp = "123456";

        when(otpProvider.verify(email, otp)).thenThrow(new InvalidOtpException("Expired"));

        mockMvc.perform(post("/auth/verify-email-otp")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new VerifyOtpRequest(email, otp))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Expired"));
    }

    @Test
    void sendOtpSucceeds() throws Exception {
        User user = User.builder().email(email).build();
        when(userDao.findByEmail(email)).thenReturn(Optional.of(user));

        String reason = "Hello world";
        mockMvc.perform(post("/auth/send-otp")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new SendOtpRequest(email, reason))))
                .andExpect(status().isOk());

        verify(otpProvider).send(user, reason);
        userDao.updateOtp(user);
    }

    @Test
    void verifyOtpPasswordsSucceeds() throws Exception {
        String otp = "123456";
        when(otpProvider.verify(signInRequest.email(), otp))
                .thenReturn(Optional.of(User.builder()
                        .email(signInRequest.email())
                        .otp(otp)
                        .otpExpiration(LocalDateTime.now().plusMinutes(30))
                        .build()));


        mockMvc.perform(post("/auth/verify-reset-password-otp")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new VerifyOtpRequest(email, otp))))
                .andExpect(status().isOk());
    }

    @Test
    void verifyOtpReturnsAnErrorIfTheOtpIsInvalid() throws Exception {
        String otp = "123456";
        when(otpProvider.verify(signInRequest.email(), otp)).thenThrow(new InvalidOtpException("Not found"));

        mockMvc.perform(post("/auth/verify-reset-password-otp")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new VerifyOtpRequest(email, otp))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Not found"));
    }

    @Test
    void resetPasswordSucceeds() throws Exception {
        String otp = "123456";
        String password = "Abracadabra1#";
        UUID id = UUID.randomUUID();
        User user = User.builder().id(id).email(email).otp(otp).otpExpiration(LocalDateTime.now().plusMinutes(30)).build();

        when(userDao.findByEmail(user.getEmail())).thenReturn(Optional.of(user));

        mockMvc.perform(patch("/auth/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new ResetPasswordRequest(email, password, otp))))
                .andExpect(status().isOk());

        assertThat(user.getOtpExpiration()).isNull();
        assertThat(user.getOtp()).isNull();
    }

    @Test
    void signOutSucceeds() throws Exception {
        when(daoUserDetailsService.loadUserByUsername(email)).thenReturn(userDetails);
        when(jwtProvider.verify("this-is-a-jwt-trust-me")).thenReturn(email);

        mockMvc.perform(post("/auth/sign-out")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", "Bearer this-is-a-jwt-trust-me"))
                .andExpect(status().isOk());

        verify(daoUserDetailsService).loadUserByUsername(email);
        verify(jwtProvider).invalidate("this-is-a-jwt-trust-me");
    }
}
