package com.github.bytestrick.tabula.controller.dto.table;

/**
 * DTO representing a successfully updated cell, returned by the backend
 * after a patch operation. Used by the frontend to update the cell locally.
 *
 * @param rowIndex    The zero-based index of the row containing the updated cell.
 * @param columnIndex The zero-based index of the column containing the updated cell.
 * @param value       The new value assigned to the cell.
 */
public record CellPatchedDTO(
   int rowIndex,
   int columnIndex,
   String value
) {}
