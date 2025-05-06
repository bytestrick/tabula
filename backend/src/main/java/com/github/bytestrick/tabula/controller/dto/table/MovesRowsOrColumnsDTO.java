package com.github.bytestrick.tabula.controller.dto.table;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

import java.util.List;
import java.util.UUID;


/**
 * Data Transfer Object sent to request moving rows or columns.
 *
 * @param idsToMove A non-null, non-empty list of UUIDs identifying the rows or columns
 *                  to be moved.
 * @param fromIndex Zero-based index used as the reference point for the movement.
 *                  Must be ≥ 0.
 * @param toIndex   Zero-based index indicating the desired position relative to {@code fromIndex}.
 *                  Must be ≥ 0.
 */
public record MovesRowsOrColumnsDTO(
        @NotNull @NotEmpty List<@NotNull UUID> idsToMove,
        @PositiveOrZero int fromIndex,
        @PositiveOrZero int toIndex
) {
}
