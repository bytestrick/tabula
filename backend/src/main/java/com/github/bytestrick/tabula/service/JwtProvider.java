package com.github.bytestrick.tabula.service;

import com.github.bytestrick.tabula.repository.InvalidJwtDao;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

/**
 * Service that manages JSON Web Tokens
 */
@Service
public class JwtProvider {
    private final InvalidJwtDao invalidJwtDao;
    @Value("${app.jwt.expiration-ms}")
    private long jwtExpirationMs;
    @Value("${app.jwt.secret}")
    private String jwtSecret;
    /**
     * Secret key used to sign and verify JSON Web Tokens
     */
    private SecretKey secretKey;

    public JwtProvider(InvalidJwtDao invalidJwtDao) {
        this.invalidJwtDao = invalidJwtDao;
    }

    /**
     * Extract a JSON Web Token from an HTTP request
     */
    public static String fromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }

    @PostConstruct
    public void init() {
        secretKey = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }

    /**
     * Generate a JSON Web Token for an authenticated user
     *
     * @return the new token
     */
    public String generateToken(String username) {
        Date now = new Date();
        return Jwts.builder()
                .subject(username)
                .issuedAt(now)
                .expiration(new Date(now.getTime() + jwtExpirationMs))
                .signWith(secretKey)
                .compact();
    }

    /**
     * Validate a JSON Web Token
     *
     * @return the username of the user associated with the token
     */
    public String validateToken(String token) {
        try {
            if (invalidJwtDao.exists(token)) {
                return null;
            }
            return Jwts.parser()
                    .verifyWith(secretKey)
                    .build()
                    .parseSignedClaims(token).getPayload().getSubject();
        } catch (Exception e) {
            return null;
        }
    }

    /**
     * Blacklist a JSON Web Token
     */
    public void invalidateToken(String token) {
        invalidJwtDao.save(token);
    }

    /**
     * Extract the expiration timestamp from a JSON Web Token
     */
    public static Date getExpiration(String token) {
        return Jwts.parser()
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getExpiration();
    }
}
