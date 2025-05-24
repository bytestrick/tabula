package com.github.bytestrick.tabula.controller.dto.table;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public record TableCreateDTO(
        @NotNull @Size(min = 1, max = 50) String title,
        @Size(max = 500) String description,
        @NotNull @PastOrPresent LocalDateTime creationDate
) {}
