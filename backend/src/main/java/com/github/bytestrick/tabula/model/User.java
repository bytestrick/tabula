package com.github.bytestrick.tabula.model;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import org.springframework.security.core.GrantedAuthority;

import java.util.List;
import java.util.UUID;

@Data
@AllArgsConstructor
@Builder
public class User {
    @NotNull
    private final UUID id;

    @NotNull(message = "Email cannot be null.")
    @Email(message = "Invalid email.")
    private String email;

    @NotNull
    @Size(min = 60, max = 60, message = "Encoded password have length of 60.")
    private String encodedPassword;

    @NotNull
    private List<GrantedAuthority> roles;

    @NotNull
    @Size(min = 2, max = 200, message = "Name must be between 2 and 200 characters long.")
    private String name;

    @NotNull
    @Size(min = 2, max = 200, message = "Surname must be between 2 and 200 characters long.")
    private String surname;

    @Valid
    @NotNull(message = "Country cannot be null.")
    private Country country;
}
