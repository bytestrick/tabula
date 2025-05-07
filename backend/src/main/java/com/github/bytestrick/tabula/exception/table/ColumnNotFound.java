package com.github.bytestrick.tabula.exception.table;

import java.util.UUID;

/**
 * Unchecked exception thrown when a column with the specified ID cannot be found
 * in the given table.
 */
public class ColumnNotFound extends RuntimeException {

    /**
     * Constructs a new {@code ColumnNotFound} exception with a detail message
     * containing the specified column and table IDs.
     *
     * @param columnId The UUID of the column that was not found.
     * @param tableId  The UUID of the table in which the column was expected.
     */
    public ColumnNotFound(UUID columnId, UUID tableId) {
        super("Column " + columnId + " not found for table " + tableId);
    }
}
