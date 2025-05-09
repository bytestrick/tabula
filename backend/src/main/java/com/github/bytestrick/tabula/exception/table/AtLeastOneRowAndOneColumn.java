package com.github.bytestrick.tabula.exception.table;

/**
 * Unchecked exception thrown when an operation would remove all rows or all columns
 * from a table, leaving it empty.
 */
public class AtLeastOneRowAndOneColumn extends RuntimeException {

    /**
     * Constructs a new {@code AtLeastOneRowAndOneColumn} exception with a
     * default detail message.
     */
    public AtLeastOneRowAndOneColumn() {
        super("There must be at least one row and one column.");
    }
}
