package com.github.bytestrick.tabula.controller.dto.table;

import jakarta.validation.constraints.PositiveOrZero;

import java.util.UUID;

public record ColumnPatchedDTO(
        UUID id,
        int columnIndex,
        String columnName,
        @PositiveOrZero Integer dataTypeId
) {}