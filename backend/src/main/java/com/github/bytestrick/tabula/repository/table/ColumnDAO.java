package com.github.bytestrick.tabula.repository.table;

import com.github.bytestrick.tabula.repository.interfaces.IndexesSortedDAO;
import com.github.bytestrick.tabula.repository.proxy.table.ColumnProxy;
import com.github.bytestrick.tabula.repository.proxy.table.RowProxy;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;
import java.util.UUID;

/**
 * Handles operations related to the 'my_column' table.
 * <p>
 *   Database Notes:
 *   <ul>
 *      <li>
 *          Trigger 'after_column_insertion' is defined on 'my_column' table.
 *          It automatically creates a 'cell' record for each existing row
 *          when a new column is inserted in 'my_column'.
 *      </li>
 *      <li>
 *          The 'cell' table has a foreign key on 'my_column' with ON DELETE CASCADE.
 *          Deleting a column from 'my_column' will automatically delete
 *          all associated 'cell' records.
 *      </li>
 *   </ul>
 * </p>
 */
@RequiredArgsConstructor
@Repository
public class ColumnDAO implements IndexesSortedDAO {
    private final JdbcClient jdbcClient;
    private final CellDAO cellDAO;

    /**
     * DAO method to remove a single column and reindex subsequent columns in the same table.
     * <p>
     *  Steps:
     *  <ol>
     *      <li>Retrieve the current {@code column_index} of the column to delete.</li>
     *      <li>Perform the DELETE operation for the given column UUID and table ID.</li>
     *      <li>Update all columns with {@code column_index} greater than the deleted index,
     *          decrementing their index by one.</li>
     *  </ol>
     * </p>
     * @param id        UUID of the column to delete.
     * @param tableId   UUID of the table containing the column.
     * @return          The original integer index of the deleted column.
     */
    @Transactional
    public int deleteColumn(UUID id, UUID tableId) {
        int deletedColumnIndex = jdbcClient.sql("""
                SELECT column_index
                FROM tbl_column
                WHERE id = :id
            """)
                .param("id", id)
                .query(Integer.class)
                .single();

        jdbcClient.sql("""
                DELETE FROM tbl_column
                WHERE id = :id AND tbl_table = :tableId
            """)
                .param("id", id)
                .param("tableId", tableId)
                .update();

        jdbcClient.sql("""
                UPDATE tbl_column
                SET column_index = column_index - 1
                WHERE tbl_table = :tableId AND column_index > :deletedColumnIndex
            """)
                .param("tableId", tableId)
                .param("deletedColumnIndex", deletedColumnIndex)
                .update();

        return deletedColumnIndex;
    }

    /**
     * DAO method to append a new column at the end of the specified table.
     * <p>
     *  Calculates the next {@code column_index} as one greater than the current maximum index
     *  (or 0 if the table is empty), inserts the new column with its data type, and returns a proxy object
     *  representing the newly created column.
     * </p>
     * @param tableId     UUID of the table to which the new column will be appended.
     * @param newColumnId UUID of the new column to insert.
     * @param dataTypeId  Integer identifier of the data type for the new column.
     * @return            {@link ColumnProxy}
     */
    public ColumnProxy appendColumn(UUID tableId, UUID newColumnId, int dataTypeId) {
        int columnIndex = jdbcClient.sql("""
                SELECT COALESCE(MAX(column_index), -1) + 1
                FROM tbl_column
                WHERE tbl_table = :tableId
            """)
                .param("tableId", tableId)
                .query(Integer.class)
                .single();

        jdbcClient.sql("""
            INSERT INTO tbl_column (id, tbl_table, data_type, column_index)
            VALUES (:id, :tableId, :dataTypeId, :columnIndex)
            """)
                .param("id", newColumnId)
                .param("tableId", tableId)
                .param("dataTypeId", dataTypeId)
                .param("columnIndex", columnIndex)
                .update();

        return new ColumnProxy(newColumnId, tableId, dataTypeId, "", columnIndex, cellDAO);
    }

    /**
     * DAO method to insert a new column at a specific index within the specified table.
     * <p>
     *  Shifts existing columns with indexes greater than or equal to the provided index
     *  by incrementing their {@code column_index}, then inserts the new column at the target position.
     * </p>
     * @param tableId     UUID of the table into which the new column will be inserted.
     * @param newColumnId UUID of the new column to insert.
     * @param dataTypeId  Integer identifier of the data type for the new column.
     * @param columnIndex Target index at which to insert the new column.
     * @return            {@link ColumnProxy}
     */
    @Transactional
    public ColumnProxy insertColumnAt(UUID tableId, UUID newColumnId, int dataTypeId, int columnIndex) {
        jdbcClient.sql("""
                UPDATE tbl_column
                SET column_index = column_index + 1
                WHERE tbl_table = :tableId AND column_index >= :columnIndex
            """)
                .param("columnIndex", columnIndex)
                .param("tableId", tableId)
                .update();

        jdbcClient.sql("""
                INSERT INTO tbl_column (id, tbl_table, data_type, column_index)
                VALUES (:id, :tableId, :dataTypeId, :columnIndex)
            """)
                .param("id", newColumnId)
                .param("tableId", tableId)
                .param("dataTypeId", dataTypeId)
                .param("columnIndex", columnIndex)
                .update();

        return new ColumnProxy(newColumnId, tableId, dataTypeId, null, columnIndex, cellDAO);
    }

    /**
     * DAO method to retrieve all columns for a given table, ordered by their index.
     *
     * @param tableId UUID of the table whose columns are to be fetched.
     * @return        List of {@link ColumnProxy} objects representing each column,
     *                sorted by {@code column_index} in ascending order.
     */
    public List<ColumnProxy> findAllColumn(UUID tableId) {
        return jdbcClient.sql("""
                SELECT *
                FROM tbl_column
                WHERE tbl_table = :tableId
                ORDER BY column_index
            """)
                .param("tableId", tableId)
                .query(new ColumnMapper()).list();
    }

    /**
     * DAO method to update the data-type of a column within a table.
     *
     * @param tableId    UUID of the table containing the column.
     * @param columnId   UUID of the column whose data type is to be changed.
     * @param dataTypeId New integer identifier for the column's data type.
     */
    public void changeColumnDataType(UUID tableId, UUID columnId, int dataTypeId) {
        jdbcClient.sql("""
                UPDATE tbl_column
                SET data_type = :dataTypeId
                WHERE id = :columnId AND tbl_table = :tableId
            """)
                .param("dataTypeId", dataTypeId)
                .param("columnId", columnId)
                .param("tableId", tableId)
                .update();
    }

    /**
     * DAO method to find the UUID of a column by its index within a table.
     *
     * @param tableId     UUID of the table containing the column.
     * @param columnIndex Integer index of the column to locate.
     * @return            UUID of the column matching the specified index.
     */
    public UUID findColumnIdByIndex(UUID tableId, int columnIndex) {
        return jdbcClient.sql("""
                SELECT id
                FROM tbl_column
                WHERE tbl_table = :tableId AND column_index = :columnIndex
            """)
                .param("tableId", tableId)
                .param("columnIndex", columnIndex)
                .query(UUID.class)
                .single();
    }

    /**
     * Updates the {@code column_index} of an existing column.
     *
     * @param columnId
     *   UUID of the column to move.
     * @param newColumnIndex
     *   New zero-based index for the column.
     * @param tableId
     *   UUID of the table containing the column.
     */
    public void updateColumnIndex(UUID columnId, int newColumnIndex, UUID tableId) {
        jdbcClient.sql("""
                UPDATE tbl_column
                SET column_index = :newColumnIndex
                WHERE id = :columnId AND tbl_table = :tableId;
            """)
                .param("newColumnIndex", newColumnIndex)
                .param("tableId", tableId)
                .param("columnId", columnId)
                .update();
    }

    /**
     * Updates the name of a specific column.
     *
     * @param tableId
     *   UUID of the table containing the column.
     * @param columnId
     *   UUID of the column to rename.
     * @param newName
     *   The new name to assign to the column.
     */
    public void changeColumnName(UUID tableId, UUID columnId, String newName) {
        jdbcClient.sql("""
                UPDATE tbl_column
                SET column_name = :newName
                WHERE id = :columnId AND tbl_table = :tableId;
            """)
                .param("tableId", tableId)
                .param("columnId", columnId)
                .param("newName", newName)
                .update();
    }

    /**
     * Returns the zero-based index of the given column UUID.
     *
     * @param tableId
     *   UUID of the table.
     * @param columnId
     *   UUID of the column.
     * @return
     *   Integer index of the column.
     */
    public int findColumnIndexById(UUID tableId, UUID columnId) {
        return jdbcClient.sql("""
                SELECT column_index
                FROM tbl_column
                WHERE tbl_table = :tableId AND id = :columnId
            """)
                .param("tableId", tableId)
                .param("columnId", columnId)
                .query(Integer.class)
                .single();
    }

    /**
     * Counts the number of columns in the given table.
     *
     * @param tableId
     *   UUID of the table.
     * @return
     *   Total count of columns.
     */
    public int getColumnNumber(UUID tableId) {
        return jdbcClient.sql("""
                SELECT COUNT(*)
                FROM tbl_column
                WHERE tbl_table = :tableId
            """)
                .param("tableId", tableId)
                .query(Integer.class)
                .single();
    }

    /**
     * Check to see if the column exists within a table.
     *
     * @param tableId Id of the table.
     * @param columnId Id to check.
     * @return Returns {@code true} if the {@code columnId} is associated with the table {@code tableId}.
     */
    public boolean columnExists(UUID tableId, UUID columnId) {
        return jdbcClient.sql("""
                SELECT EXISTS(
                    SELECT 1
                    FROM tbl_column
                    WHERE id = :columnId AND tbl_table = :tableId
                )
            """)
                .param("tableId", tableId)
                .param("columnId", columnId)
                .query(Boolean.class)
                .single();
    }

    /**
     * Retrieves the index of a single column by its UUID.
     *
     * @param tableId
     *   UUID of the table.
     * @param columnId
     *   UUID of the column.
     * @return
     *   Zero-based index of the specified column.
     */
    public Integer findColumnIndexFromId(UUID tableId, UUID columnId) {
        return jdbcClient.sql("""
                SELECT column_index
                FROM tbl_column
                WHERE tbl_table = :tableId AND id =:columnId
            """)
                .param("tableId", tableId)
                .param("columnId", columnId)
                .query(Integer.class)
                .single();
    }

    /**
     * Checks whether a column’s stored data type matches the given ID.
     *
     * @param tableId
     *   UUID of the table.
     * @param columnId
     *   UUID of the column.
     * @param dataTypeId
     *   Data type ID to compare.
     * @return
     *   {@code true} if the column’s data type equals {@code dataTypeId}, {@code false} otherwise.
     */
    public Boolean matchColumnDataType(UUID tableId, UUID columnId, int dataTypeId) {
        return jdbcClient.sql("""
                SELECT COALESCE(data_type = :dataTypeId, false)
                FROM tbl_column
                WHERE tbl_table = :tableId AND id = :columnId
            """)
                .param("tableId", tableId)
                .param("columnId", columnId)
                .param("dataTypeId", dataTypeId)
                .query(Boolean.class)
                .single();
    }

    /**
     * Implementation of the {@code findIndexesFromIdsSortedAscending} method of {@link IndexesSortedDAO}.
     * <p>Retrieves the indexes (sorted in ascending order) of multiple rows by their UUIDs.</p>
     *
     * @param tableId
     *   UUID of the table.
     * @param ids
     *   List of column UUIDs whose indexes are needed.
     * @return
     *   List of zero-based column indexes (sorted in ascending order) matching the provided IDs.
     */
    @Override
    public List<Integer> findIndexesFromIdsSortedAscending(UUID tableId, List<UUID> ids) {
        return jdbcClient.sql("""
                SELECT column_index
                FROM tbl_column
                WHERE tbl_table = :tableId AND id IN (:columnsIds)
                ORDER BY column_index
            """)
                .param("tableId", tableId)
                .param("columnsIds", ids)
                .query(Integer.class)
                .list();
    }

    /**
     * Implementation of the {@code findIndexesFromIdsSortedDescending} method of {@link IndexesSortedDAO}.
     * <p>Retrieves the indexes (sorted in descending order) of multiple rows by their UUIDs.</p>
     *
     * @param tableId
     *   UUID of the table.
     * @param ids
     *   List of column UUIDs whose indexes are needed.
     * @return
     *   List of zero-based column indexes (deorted in ascending order) matching the provided IDs.
     */
    @Override
    public List<Integer> findIndexesFromIdsSortedDescending(UUID tableId, List<UUID> ids) {
        return jdbcClient.sql("""
                SELECT column_index
                FROM tbl_column
                WHERE tbl_table = :tableId AND id IN (:columnsIds)
                ORDER BY column_index DESC
            """)
                .param("tableId", tableId)
                .param("columnsIds", ids)
                .query(Integer.class)
                .list();
    }

    /**
     * Retrieves a column proxy by its zero-based index within a table.
     *
     * @param tableId     UUID of the table containing the column.
     * @param columnIndex Zero-based index of the column to retrieve.
     * @return The {@link ColumnProxy} representing the found column.
     */
    public ColumnProxy findColumnByIndex(UUID tableId, int columnIndex) {
        return jdbcClient.sql("""
                SELECT *
                FROM tbl_column
                WHERE tbl_table = :tableId AND column_index = :columnIndex
            """)
                .param("tableId", tableId)
                .param("columnIndex", columnIndex)
                .query(new ColumnMapper())
                .single();
    }

    private class ColumnMapper implements RowMapper<ColumnProxy> {

        @Override
        public ColumnProxy mapRow(ResultSet rs, int rowNum) throws SQLException {
            return new ColumnProxy(
                    UUID.fromString(rs.getString("id")),
                    UUID.fromString(rs.getString("tbl_table")),
                    rs.getInt("data_type"),
                    rs.getString("column_name"),
                    rs.getInt("column_index"),
                    cellDAO
            );
        }
    }
}
