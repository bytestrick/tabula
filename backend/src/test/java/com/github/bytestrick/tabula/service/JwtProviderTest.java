package com.github.bytestrick.tabula.service;


import com.github.bytestrick.tabula.exception.InvalidJwtException;
import com.github.bytestrick.tabula.model.User;
import com.github.bytestrick.tabula.repository.InvalidJwtDao;
import com.github.bytestrick.tabula.repository.UserDao;
import com.nimbusds.jose.JOSEException;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.text.ParseException;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
import static org.assertj.core.api.AssertionsForClassTypes.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class JwtProviderTest {
    private static final String EMAIL = "test@example.com";
    @MockitoBean
    private InvalidJwtDao invalidJwtDao;

    @Autowired
    private JwtProvider jwtProvider;

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private UserDao userDao;

    @Test
    void fromRequestReturnsTheTokenInARequest() {
        String token = "hillbilly bathrobe Osborn portends";
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer " + token);
        assertThat(JwtProvider.fromRequest(request)).isEqualTo(token);

        assertThat(JwtProvider.fromRequest(new MockHttpServletRequest())).isNull();
    }

    @Test
    void getExpirationGivesTheExpirationOfAToken() throws JOSEException, ParseException {
        String token = jwtProvider.create(Map.of(), null, Duration.ZERO, Duration.ofHours(194));

        assertThat(JwtProvider.getExpiration(token))
                .isEqualTo(SignedJWT.parse(token).getJWTClaimsSet().getExpirationTime());
    }

    @Test
    void createSucceeds() throws JOSEException, ParseException {
        String token = jwtProvider.create(Map.of("hello", "world"), "test@example.com", Duration.ZERO,
                Duration.ofHours(42));
        assertThat(token).isNotNull();

        JWTClaimsSet claims = SignedJWT.parse(token).getJWTClaimsSet();
        assertThat(Duration.between(claims.getIssueTime().toInstant(), claims.getExpirationTime().toInstant()))
                .isEqualTo(Duration.ofHours(42));
        assertThat(claims.getSubject()).isEqualTo("test@example.com");
        assertThat(claims.getClaim("hello")).isEqualTo("world");
    }

    @Test
    void verifyVerifiesATokenWithTheSameKeyItWasSignedWith() throws JOSEException {
        String token = jwtProvider.create(Map.of(), "test@example.com", Duration.ZERO, Duration.ofMinutes(1));
        assertThat(jwtProvider.verify(token)).isEqualTo("test@example.com");
    }

    @Test
    void verifyFailsWithAnInvalidToken() {
        assertThatThrownBy(() ->
                jwtProvider.verify("fictionalizes cleanly subprime nasalization unprofessional"))
                .isInstanceOf(InvalidJwtException.class)
                .hasMessage("Malformed token");

        assertThatThrownBy(() ->
                jwtProvider.verify(jwtProvider.create(Map.of(), null, Duration.ZERO, Duration.ZERO)))
                .isInstanceOf(InvalidJwtException.class)
                .hasMessageContaining("Expired token");

        assertThatThrownBy(() -> jwtProvider.verify(
                jwtProvider.create(Map.of(), null, Duration.ofMinutes(10), Duration.ofMinutes(30))))
                .isInstanceOf(InvalidJwtException.class)
                .hasMessageContaining("Token not enabled yet");
    }

    @Test
    void invalidateBlacklistsATokenSoThatAllSubsequentValidationsAttemptsFail() throws Exception {
        String token = jwtProvider.create(Map.of(), EMAIL, Duration.ZERO, Duration.ofDays(365));
        jwtProvider.invalidate(token);
        verify(invalidJwtDao).save(token);

        when(invalidJwtDao.exists(token)).thenReturn(false);
        when(userDao.findByEmail(EMAIL)).thenReturn(
                Optional.of(User.builder()
                        .email(EMAIL)
                        .encodedPassword("12")
                        .roles(List.of(new SimpleGrantedAuthority("USER")))
                        .build()));

        mockMvc.perform(get("/test")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());

        when(invalidJwtDao.exists(token)).thenReturn(true);

        mockMvc.perform(get("/test")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());
    }
}

@Nested
@RestController
class JwtProviderTestController {
    @GetMapping("/test")
    ResponseEntity<?> testEndpoint() {
        return ResponseEntity.ok().build();
    }
}
