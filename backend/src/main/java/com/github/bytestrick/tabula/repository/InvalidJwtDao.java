package com.github.bytestrick.tabula.repository;

import com.github.bytestrick.tabula.service.JwtProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

import java.text.ParseException;

@Repository
@RequiredArgsConstructor
public class InvalidJwtDao {
    private final JdbcClient jdbcClient;

    public void save(String token) throws ParseException {
        jdbcClient.sql("INSERT INTO invalid_jwt VALUES (:token, :expiration_date)")
                .param("token", token)
                .param("expiration_date", JwtProvider.getExpiration(token))
                .update();
    }

    public boolean exists(String token) {
        return jdbcClient.sql("SELECT * FROM invalid_jwt WHERE token = :token")
                .param("token", token)
                .query()
                .optionalValue().isPresent();
    }
}
