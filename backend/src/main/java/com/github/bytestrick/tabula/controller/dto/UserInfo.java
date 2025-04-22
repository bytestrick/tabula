package com.github.bytestrick.tabula.controller.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UserInfo(@NotNull @Size(min = 2, max = 50) String name,
                       @NotNull @Size(min = 2, max = 50) String surname,
                       @NotNull @Email String email) {}
