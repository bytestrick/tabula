package com.github.bytestrick.tabula.controller.dto.table;

import jakarta.validation.constraints.PositiveOrZero;


/**
 * Data Transfer Object (DTO) sent by the frontend to the backend
 * to request creation of a new column in a table.
 *
 * @param dataTypeId   Numeric code identifying the column’s data type; must be zero or positive.
 * @param columnIndex  Optional zero-based position at which to insert the new column.
 *                     If {@code null}, the column is appended at the end.
 */
public record ColumnCreateDTO(
        @PositiveOrZero int dataTypeId,
        @PositiveOrZero Integer columnIndex
) {}
