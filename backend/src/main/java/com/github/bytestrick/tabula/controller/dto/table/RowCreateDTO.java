package com.github.bytestrick.tabula.controller.dto.table;

import jakarta.validation.constraints.PositiveOrZero;

/**
 * Data Transfer Object (DTO) sent by the frontend to the backend
 * to request creation of a new row in a table.
 *
 * <p>If {@code rowIndex} is {@code null}, the row is appended at the end;
 * if {@code rowIndex} is non-null and {@code duplicateFlag} is {@code true},
 * the row will be duplicated from the existing row at the specified index.</p>
 *
 * @param rowIndex      optional zero-based index at which to insert or duplicate the new row;
 *                      if {@code null}, the row is appended at the end
 * @param duplicateFlag when {@code true} and {@code rowIndex} is non-null, the new row
 *                      will be a duplicate of the row at {@code rowIndex}. The duplicated
 *  *                      row is inserted at {@code rowIndex}.
 */
public record RowCreateDTO(
        @PositiveOrZero Integer rowIndex,
        boolean duplicateFlag
) {}
