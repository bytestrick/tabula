package com.github.bytestrick.tabula.controller.dto.table;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

import java.util.List;
import java.util.UUID;

public record MovesRowsOrColumnsDTO(
        @NotNull @NotEmpty List<@NotNull UUID> idsToMove,
        @PositiveOrZero int fromIndex,
        @PositiveOrZero int toIndex
) {}
