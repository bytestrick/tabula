package com.github.bytestrick.tabula.controller.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;
import java.util.UUID;

public record TableCardDto(
        @NotNull UUID id,
        @NotNull @Size(min = 1, max = 50) String title,
        @Size(max = 500) String description,
        @NotNull @PastOrPresent LocalDateTime creationDate,
        LocalDateTime lastEditDate
) {}