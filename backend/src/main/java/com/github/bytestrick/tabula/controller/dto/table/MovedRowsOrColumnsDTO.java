package com.github.bytestrick.tabula.controller.dto.table;


import java.util.List;

/**
 * Data Transfer Object returned when rows or columns have been moved.
 *
 * @param indexes
 *   A list of zero-based indexes that were moved. For multiple selections,
 *   these are the original positions of all moved items; for a single move,
 *   this list will contain only the single index that was shifted.
 * @param delta
 *   The offset by which each index in {@code indexes} should be adjusted
 *   to obtain its new position (can be positive: right/down or negative: left/up).
 */
public record MovedRowsOrColumnsDTO(
        List<Integer> indexes,
        int delta
) {}
