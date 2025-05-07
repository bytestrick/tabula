package com.github.bytestrick.tabula.exception.table;

import java.util.UUID;

/**
 * Unchecked exception thrown when no table exists for the given UUID.
 */
public class TableNotFoundException extends RuntimeException {


  /**
   * Constructs a new {@code TableNotFoundException} with message
   * that includes the missing table’s UUID.
   *
   * @param tableId
   *        the UUID of the table that could not be found
   */
  public TableNotFoundException(UUID tableId) {
    super("Table " + tableId + " not found.");
  }
}
