package com.github.bytestrick.tabula.controller.dto.table;

/**
 * Data Transfer Object (DTO) sent by the frontend to update the value of a single cell.
 * Only the {@code value} field is used; all other cell properties remain unchanged.
 *
 * @param value
 *   The new content for the cell.
 */
public record CellPatchDTO(
        String value
) {}
