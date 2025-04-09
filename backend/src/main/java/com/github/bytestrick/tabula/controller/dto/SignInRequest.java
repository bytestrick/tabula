package com.github.bytestrick.tabula.controller.dto;

import com.github.bytestrick.tabula.config.Constants;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record SignInRequest(@NotBlank @Email String email,
                            @NotBlank @Size(min = 10, max = 512) @Pattern(regexp = Constants.PASSWORD_REGEXP)
                            String password,
                            boolean rememberMe) {
}