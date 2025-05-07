package com.github.bytestrick.tabula.repository.table;

import com.github.bytestrick.tabula.repository.interfaces.IndexesSortedDAO;
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
 * Handles operations related to the 'my_row' table.
 * <p>
 *  Database Notes:
 *  <ul>
 *      <li>
 *          Trigger 'after_row_insertion' is defined on 'my_row' table.
 *          It automatically creates a 'cell' record for each existing column
 *          when a new row is inserted on 'my_row'.
 *      </li>
 *      <li>
 *          The 'cell' table has a foreign key on 'my_row' with ON DELETE CASCADE.
 *          Deleting a row from 'my_row' will automatically delete
 *          all associated 'cell' records.
 *      </li>
 *   </ul>
 * </p>
 */
@RequiredArgsConstructor
@Repository
public class RowDAO implements IndexesSortedDAO {

    private final JdbcClient jdbcClient;
    private final CellDAO cellDAO;


    /**
     * DAO method to remove a single row and reindex subsequent rows in the same table.
     * <p>
     *  Steps:
     *  <ol>
     *      <li>Retrieve the current {@code row_index} of the row to delete.</li>
     *      <li>Perform the DELETE operation for the given row UUID and table ID.</li>
     *      <li>Update all rows with {@code row_index} greater than the deleted index,
     *          decrementing their index by one.</li>
     *  </ol>
     * </p>
     * @param tableId  UUID of the table containing the row.
     * @param id       UUID of the row to delete.
     * @return         The original integer index of the deleted row.
     */
    @Transactional
    public int deleteRow(UUID tableId, UUID id) {
        int deletedRowIndex = jdbcClient.sql("""
                SELECT row_index
                FROM tbl_row
                WHERE id = :id
            """)
                .param("id", id)
                .query(Integer.class)
                .single();

        jdbcClient.sql("""
                DELETE FROM tbl_row
                WHERE id = :id AND tbl_table = :tableId
            """)
                .param("id", id)
                .param("tableId", tableId)
                .update();

        jdbcClient.sql("""
                UPDATE tbl_row
                SET row_index = row_index - 1
                WHERE tbl_table = :tableId AND row_index > :deletedRowIndex
            """)
                .param("tableId", tableId)
                .param("deletedRowIndex", deletedRowIndex)
                .update();

        return deletedRowIndex;
    }


    /**
     * DAO method to append a new row at the end of the specified table.
     * <p>
     *  Calculates the next {@code row_index} as one greater than the current maximum index
     *  (or 0 if the table is empty), inserts the new row, and returns a proxy object
     *  representing the newly created row.
     * </p>
     * @param tableId  UUID of the table to which the new row will be appended.
     * @param newRowId UUID of the new row to insert.
     * @return         {@link RowProxy}
     */
    @Transactional
    public RowProxy appendNewRow(UUID tableId, UUID newRowId) {
        int rowIndex = jdbcClient.sql("""
                SELECT COALESCE(MAX(row_index), -1) + 1
                FROM tbl_row
                WHERE tbl_table = :tableId
            """)
                .param("tableId", tableId)
                .query(Integer.class)
                .single();

        jdbcClient.sql("""
                INSERT INTO tbl_row (id, tbl_table, row_index)
                VALUES (:id, :tableId, :rowIndex)
            """)
                .param("id", newRowId)
                .param("tableId", tableId)
                .param("rowIndex", rowIndex)
                .update();

        return new RowProxy(newRowId, tableId, rowIndex, cellDAO);
    }


    /**
     * Check to see if the row exists within a table.
     *
     * @param tableId Id of the table.
     * @param rowId Id to check.
     * @return Returns {@code true} if the {@code rowId} is associated with the table {@code tableId}.
     */
    public boolean rowExists(UUID tableId, UUID rowId) {
        return jdbcClient.sql("""
                SELECT EXISTS(
                    SELECT 1
                    FROM tbl_row
                    WHERE id = :rowId AND tbl_table = :tableId
                )
            """)
                .param("tableId", tableId)
                .param("rowId", rowId)
                .query(Boolean.class)
                .single();
    }


    /**
     * DAO method to insert a new row at a specific index within the specified table.
     * <p>
     *  Shifts existing rows with indexes greater than or equal to the provided index
     *  by incrementing their {@code row_index}, then inserts the new row at the target position.
     * </p>
     * @param tableId  UUID of the table into which the new row will be inserted.
     * @param newRowId UUID of the new row to insert.
     * @param rowIndex Target index at which to insert the new row.
     * @return         {@link RowProxy}
     */
    @Transactional
    public RowProxy insertNewRowAt(UUID tableId, UUID newRowId, int rowIndex) {
        jdbcClient.sql("""
                UPDATE tbl_row
                SET row_index = row_index + 1
                WHERE tbl_table = :tableId AND row_index >= :rowIndex
            """)
                .param("rowIndex", rowIndex)
                .param("tableId", tableId)
                .update();

        jdbcClient.sql("""
                INSERT INTO tbl_row (id, tbl_table, row_index)
                VALUES (:id, :tableId, :rowIndex)
            """)
                .param("id", newRowId)
                .param("tableId", tableId)
                .param("rowIndex", rowIndex)
                .update();

        return new RowProxy(newRowId, tableId, rowIndex, cellDAO);
    }


    /**
     * DAO method to retrieve all rows for a given table, ordered by their index.
     *
     * @param tableId UUID of the table whose rows are to be fetched.
     * @return        List of {@link RowProxy} objects representing each row,
     *                sorted by {@code row_index} in ascending order.
     */
    public List<RowProxy> findAllRows(UUID tableId) {
        return jdbcClient.sql("""
                SELECT *
                FROM tbl_row
                WHERE tbl_table = :tableId
                ORDER BY row_index
            """)
                .param("tableId", tableId)
                .query(new MyRowMapper()).list();
    }


    /**
     * DAO method to find the UUID of a row by its index within a table.
     *
     * @param tableId  UUID of the table containing the row.
     * @param rowIndex Integer index of the row to locate.
     * @return         UUID of the row matching the specified index.
     */
    public UUID findRowIdByIndex(UUID tableId, int rowIndex) {
        return jdbcClient.sql("""
                SELECT id
                FROM tbl_row
                WHERE tbl_table = :tableId AND row_index = :rowIndex
            """)
                .param("tableId", tableId)
                .param("rowIndex", rowIndex)
                .query(UUID.class)
                .single();
    }


    /**
     * Updates the index of an existing row.
     *
     * @param rowId
     *   UUID of the row to update.
     * @param newRowIndex
     *   The new zero-based index to assign.
     * @param tableId
     *   UUID of the table containing the row.
     */
    public void updateRowIndex(UUID rowId, int newRowIndex, UUID tableId) {
        jdbcClient.sql("""
                UPDATE tbl_row
                SET row_index = :newRowIndex
                WHERE id = :rowId AND tbl_table = :tableId;
            """)
                .param("newRowIndex", newRowIndex)
                .param("tableId", tableId)
                .param("rowId", rowId)
                .update();
    }


    /**
     * Counts the number of rows in a table.
     *
     * @param tableId
     *   UUID of the table to count rows for.
     * @return
     *   Total number of rows in the table.
     */
    public int getRowsNumber(UUID tableId) {
        return jdbcClient.sql("""
                SELECT COUNT(*)
                FROM tbl_row
                WHERE tbl_table = :tableId
            """)
                .param("tableId", tableId)
                .query(Integer.class)
                .single();
    }


    /**
     * Implementation of the {@code findIndexesFromIdsSortedAscending} method of {@link IndexesSortedDAO}.
     * <p>Retrieves the indexes (sorted in ascending order) of multiple rows by their UUIDs.</p>
     *
     * @param tableId
     *   UUID of the table containing the rows.
     * @param ids
     *   List of row UUIDs whose indexes are to be fetched.
     * @return
     *   A list of zero-based row indexes (sorted in ascending order) matching the provided IDs.
     */
    @Override
    public List<Integer> findIndexesFromIdsSortedAscending(UUID tableId, List<UUID> ids) {
        return jdbcClient.sql("""
                SELECT row_index
                FROM tbl_row
                WHERE tbl_table = :tableId AND id IN (:rowIds)
                ORDER BY row_index
            """)
                .param("tableId", tableId)
                .param("rowIds", ids)
                .query(Integer.class)
                .list();
    }


    /**
     * Implementation of the {@code findIndexesFromIdsSortedDescending} method of {@link IndexesSortedDAO}.
     * <p>Retrieves the indexes (sorted in descending order) of multiple rows by their UUIDs.</p>
     *
     * @param tableId
     *   UUID of the table containing the rows.
     * @param ids
     *   List of row UUIDs whose indexes are to be fetched.
     * @return
     *   A list of zero-based row indexes (sorted in descending order) matching the provided IDs.
     */
    @Override
    public List<Integer> findIndexesFromIdsSortedDescending(UUID tableId, List<UUID> ids) {
        return jdbcClient.sql("""
                SELECT row_index
                FROM tbl_row
                WHERE tbl_table = :tableId AND id IN (:rowIds)
                ORDER BY row_index DESC
            """)
                .param("tableId", tableId)
                .param("rowIds", ids)
                .query(Integer.class)
                .list();
    }


    /**
     * Retrieves the index of a single row by its UUID.
     *
     * @param tableId
     *   UUID of the table containing the row.
     * @param rowId
     *   UUID of the row whose index is to be fetched.
     * @return
     *   The zero-based index of the specified row.
     */
    public Integer findRowIndexFromId(UUID tableId, UUID rowId) {
        return jdbcClient.sql("""
                SELECT row_index
                FROM tbl_row
                WHERE tbl_table = :tableId AND id = :rowId
            """)
                .param("tableId", tableId)
                .param("rowId", rowId)
                .query(Integer.class)
                .single();
    }


    private class MyRowMapper implements RowMapper<RowProxy> {

        @Override
        public RowProxy mapRow(ResultSet rs, int rowNum) throws SQLException {
            return new RowProxy(
                    UUID.fromString(rs.getString("id")),
                    UUID.fromString(rs.getString("tbl_table")),
                    rs.getInt("row_index"),
                    cellDAO
            );
        }
    }
}
