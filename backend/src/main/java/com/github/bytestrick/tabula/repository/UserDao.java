package com.github.bytestrick.tabula.repository;

import com.github.bytestrick.tabula.model.Country;
import com.github.bytestrick.tabula.model.User;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.jdbc.support.rowset.SqlRowSet;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Repository;

import java.util.Arrays;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Repository
public class UserDao {
    private final JdbcClient jdbcClient;

    public UserDao(JdbcClient jdbcClient) {
        this.jdbcClient = jdbcClient;
    }

    /**
     * Map all the colums from the {@code users} table to all the fields of a {@link User} object.
     */
    private static User buildUserFromRow(SqlRowSet row) {
        return new User(
                UUID.fromString(Objects.requireNonNull(row.getString("id"))),
                row.getString("email"),
                row.getString("encoded_password"),
                Arrays.stream(Objects.requireNonNull(row.getString("roles")).split(", "))
                        .map(SimpleGrantedAuthority::new)
                        .collect(Collectors.toList()),
                row.getString("name"),
                row.getString("surname"),
                new Country(row.getString("country_name"),
                        row.getString("country_flag"),
                        row.getString("country_code"),
                        row.getInt("country_dial_code")));
    }

    public User findById(UUID id) {
        SqlRowSet row = jdbcClient
                .sql("SELECT * FROM users WHERE id = :id")
                .param("id", id)
                .query()
                .rowSet();
        if (row.next()) {
            return buildUserFromRow(row);
        }
        return null;
    }

    public Optional<User> findByEmail(String email) {
        SqlRowSet row = jdbcClient
                .sql("SELECT * FROM users WHERE email = :email")
                .param("email", email)
                .query()
                .rowSet();
        if (row.next()) {
            return Optional.of(buildUserFromRow(row));
        }
        return Optional.empty();
    }

    public void save(User user) {
        jdbcClient.sql("""
                        INSERT INTO users VALUES (:id, :email, :password, :roles, :name, :surname,
                        :country_name, :country_flag, :country_code, :country_dial_code)
                        """)
                .param("id", user.getId())
                .param("email", user.getEmail())
                .param("password", user.getEncodedPassword())
                .param("roles", user.getRoles().stream()
                        .map(GrantedAuthority::getAuthority)
                        .collect(Collectors.joining(", ")))
                .param("name", user.getName())
                .param("surname", user.getSurname())
                .param("country_name", user.getCountry().name())
                .param("country_flag", user.getCountry().flag())
                .param("country_code", user.getCountry().code())
                .param("country_dial_code", user.getCountry().dialCode())
                .update();
    }
}
