package com.github.bytestrick.tabula.controller.dto.table;

import jakarta.validation.constraints.PositiveOrZero;

/**
 * Data Transfer Object (DTO) sent by the frontend to the backend
 * to request creation of a new column in a table.
 *
 * @param dataTypeId   Numeric code identifying the column’s data type; must be zero or positive.
 * @param columnIndex  Optional zero-based position at which to insert or duplicate the new column;
 *                     if {@code null}, the column is appended at the end.
 * @param duplicateFlag When {@code true} and {@code columnIndex} is non-null, the new column
 *                      will be a duplicate of the column at {@code columnIndex}. The duplicated
 *                      column is inserted at {@code columnIndex}.
 */
public record ColumnCreateDTO(
        @PositiveOrZero int dataTypeId,
        @PositiveOrZero Integer columnIndex,
        boolean duplicateFlag
) {}
