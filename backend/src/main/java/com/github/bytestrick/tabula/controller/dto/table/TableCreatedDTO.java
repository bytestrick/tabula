package com.github.bytestrick.tabula.controller.dto.table;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;

import java.time.LocalDateTime;
import java.util.UUID;

public record TableCreatedDTO(
        UUID id,
        String title,
        String description,
        LocalDateTime creationDate,
        LocalDateTime lastEditDate
) {}