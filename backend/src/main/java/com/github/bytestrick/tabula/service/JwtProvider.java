package com.github.bytestrick.tabula.service;

import com.github.bytestrick.tabula.repository.InvalidJwtDao;
import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import jakarta.annotation.Nullable;
import jakarta.annotation.PostConstruct;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.nio.charset.StandardCharsets;
import java.text.ParseException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.time.temporal.TemporalAmount;
import java.util.Date;
import java.util.Map;

/**
 * Service that manages JSON Web Tokens
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class JwtProvider {
    private final InvalidJwtDao invalidJwtDao;

    // TODO: implement dotenv-java to store secrets or spring-dotenv
    @Value("${app.jwt.secret}")
    private String jwtSecret;

    private MACSigner signer;
    private MACVerifier verifier;

    /**
     * Extract a JSON Web Token from an HTTP request
     *
     * @return the serialized token or {@code null} if it can't be extracted from the request
     */
    public static String fromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }

    /**
     * Extract the expiration timestamp from a JSON Web Token
     */
    public static Date getExpiration(String token) throws ParseException {
        return SignedJWT.parse(token).getJWTClaimsSet().getExpirationTime();
    }

    /**
     * Create a new JSON Web Token
     *
     * @param claims     an associative array of claims to include in the token like
     *                   <p>{@code { "sub": "user", "roles": ["ROLE_USER"] }}`
     * @param notBefore  amount of time to delay the initial validity of the token
     * @param expiration amount of time after the creation of the token when it stops being valid
     * @return the new serialized token
     */
    public String create(
            Map<String, Object> claims,
            @Nullable String subject,
            TemporalAmount notBefore,
            TemporalAmount expiration
    ) throws JOSEException {
        JWTClaimsSet.Builder claimsBuilder = new JWTClaimsSet.Builder();
        for (String entry : claims.keySet()) {
            claimsBuilder.claim(entry, claims.get(entry));
        }
        if (StringUtils.hasText(subject)) {
            claimsBuilder.subject(subject);
        }
        Instant issuedAt = Instant.now().truncatedTo(ChronoUnit.SECONDS);
        JWTClaimsSet claimsSet = claimsBuilder.issueTime(Date.from(issuedAt))
                .notBeforeTime(Date.from(issuedAt.plus(notBefore)))
                .expirationTime(Date.from(issuedAt.plus(expiration))).build();

        JWSObject jwsObject = new JWSObject(new JWSHeader(JWSAlgorithm.HS256), new Payload(claimsSet.toJSONObject()));
        jwsObject.sign(signer);
        return jwsObject.serialize();
    }

    @PostConstruct
    public void init() throws JOSEException {
        byte[] bytes = jwtSecret.getBytes(StandardCharsets.UTF_8);
        signer = new MACSigner(bytes);
        verifier = new MACVerifier(bytes);
    }

    /**
     * Verify a JSON Web Token
     *
     * @param token the token to verify
     * @return the subject of the token
     * @throws ParseException when the parsing of the token fails
     * @throws JOSEException  when the cryptographic verification fails
     */
    public String verify(String token) throws JOSEException, ParseException {
        if (!invalidJwtDao.exists(token)) {
            SignedJWT jwt = SignedJWT.parse(token);
            JWTClaimsSet claims = jwt.getJWTClaimsSet();
            Date now = new Date();
            if (jwt.verify(verifier)) {
                if (now.before(claims.getExpirationTime()) && now.after(claims.getNotBeforeTime())) {
                    return claims.getSubject();
                }
            }
        }
        throw new RuntimeException("invalid token");
    }

    /**
     * Blacklist a JSON Web Token
     */
    public void invalidate(String token) {
        try {
            invalidJwtDao.save(token);
        } catch (ParseException e) {
            log.warn("Tried to store a malformed JWT", e);
        }
    }
}
