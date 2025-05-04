package com.github.bytestrick.tabula.controller.dto;

import com.github.bytestrick.tabula.model.Country;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UserDetails(@NotBlank @Size(min = 2, max = 100) String name,
                          @NotBlank @Size(min = 2, max = 100) String surname,
                          @NotBlank @Email String email,
                          @Valid Country country) {
}
