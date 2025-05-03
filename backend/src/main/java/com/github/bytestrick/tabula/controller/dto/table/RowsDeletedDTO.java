package com.github.bytestrick.tabula.controller.dto.table;

import java.util.List;


/**
 * DTO for representing the response containing the indexes of deleted rows.
 * <p>
 * Used to return to the front-end the list of positions (indexes)
 * of the rows that have been removed, so that the client view can be synchronized.
 * </p>
 *
 * @param indexes   Indexes of the deleted rows.
 */
public record RowsDeletedDTO(
        List<Integer> indexes
) {}
