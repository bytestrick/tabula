package com.github.bytestrick.tabula.model;

import jakarta.annotation.Nullable;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import org.springframework.security.core.GrantedAuthority;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@AllArgsConstructor
@Builder
public class User {
    @NotNull
    private final UUID id;

    @NotNull
    @Email
    private String email;

    @NotNull
    @Size(min = 60, max = 60)
    private String encodedPassword;

    @NotNull
    private List<GrantedAuthority> roles;

    @NotNull
    @Size(min = 2, max = 50)
    private String name;

    @NotNull
    @Size(min = 2, max = 50)
    private String surname;

    @Valid
    @NotNull
    private Country country;

    /**
     * Whether the email was verified
     */
    private boolean enabled;

    @Nullable
    private String otp;

    @Nullable
    private LocalDateTime otpExpiration;
}
