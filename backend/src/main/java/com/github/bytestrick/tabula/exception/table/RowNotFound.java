package com.github.bytestrick.tabula.exception.table;

import java.util.UUID;

/**
 * Unchecked exception thrown when a row with the specified ID cannot be found
 * in the given table.
 */
public class RowNotFound extends RuntimeException {

    /**
     * Constructs a new {@code RowNotFound} exception with a detail message
     * containing the specified row and table IDs.
     *
     * @param rowId   The UUID of the row that was not found.
     * @param tableId The UUID of the table in which the row was expected.
     */
    public RowNotFound(UUID rowId, UUID tableId) {
        super("Row " + rowId + " not found for table " + tableId);
    }
}
