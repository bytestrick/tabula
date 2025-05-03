package com.github.bytestrick.tabula.controller.dto.table;

import jakarta.validation.constraints.PositiveOrZero;

/**
 * Data Transfer Object (DTO) used for partially updating a column.
 * All fields are optional; only non-null properties will be applied.
 *
 * @param columnName  New name for the column; if {@code null}, name is left unchanged.
 * @param columnIndex New zero-based position for the column; if {@code null}, position is unchanged.
 * @param dataTypeId  New numeric code for the column’s data type; if {@code null}, data type is unchanged.
 */
public record ColumnPatchDTO(
        String columnName,
        @PositiveOrZero Integer columnIndex,
        @PositiveOrZero Integer dataTypeId
) {}
