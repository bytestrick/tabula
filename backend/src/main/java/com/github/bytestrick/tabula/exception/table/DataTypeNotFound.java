package com.github.bytestrick.tabula.exception.table;

/**
 * Exception thrown when a requested DataType cannot be found.
 * <p>
 * This unchecked exception indicates that no DataType with the given ID
 * exists in the system.
 * </p>
 */
public class DataTypeNotFound extends RuntimeException {

  /**
   * Constructs a new {@code DataTypeNotFound} exception with a detail message
   * containing the specified data type ID.
   *
   * @param dataTypeId
   *        The numeric identifier of the DataType that was not found.
   */
    public DataTypeNotFound(int dataTypeId) {
        super("DataType " + dataTypeId + " not found.");
    }
}
