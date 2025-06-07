package com.github.bytestrick.tabula.repository.table;

import com.github.bytestrick.tabula.model.table.Table;
import com.github.bytestrick.tabula.repository.proxy.table.TableProxy;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Handles operations related to the 'tbl_table' table.
 * <p>
 * Database Notes:
 *   <ul>
 *      <li>The 'tbl_table' table is referenced by 'tbl_column' and 'tbl_row'.</li>
 *      <li>
 *          Both references have the foreign key constraint: ON DELETE CASCADE.
 *          This means that deleting a record from 'tbl_table' will automatically delete
 *          the corresponding rows from 'tbl_column' and 'tbl_row'.
 *      </li>
 *      <li>
 *          The 'cell' table references both 'tbl_row' and 'tbl_column' with
 *          ON DELETE CASCADE constraints. Deleting any row or column
 *          thus also cascades deletion to related 'cell' records.
 *      </li>
 *   </ul>
 * </p>
 */
@RequiredArgsConstructor
@Repository
public class TableDAO {

    private final JdbcClient jdbcClient;
    private final RowDAO rowDAO; // used only to pass it to the TableProxy constructor
    private final ColumnDAO columnDAO; // used only to pass it to the TableProxy constructor


    /**
     * Persists a new table record in the database and returns a {@link TableProxy}.
     *
     * @param table
     *        the {@link Table} domain object containing all data to insert;
     *        its {@link Table#getId() id} must already be set to the desired UUID.
     * @return a {@link TableProxy} reflecting the newly persisted database row,
     *         including any lazily-loaded columns or child entities
     */
    @Transactional
    public TableProxy saveTable(Table table) {
        jdbcClient.sql("""
                INSERT INTO tbl_table (id, title, description, creation_date, last_edit_date, user_id)
                VALUES (:tableId, :title, :description, :creationDate, :lastEditDate, :userId)
            """)
                .param("tableId", table.getId())
                .param("title", table.getTitle())
                .param("description", table.getDescription())
                .param("creationDate", table.getCreationDate())
                .param("lastEditDate", table.getLastEditDate())
                .param("userId", table.getUserId())
                .update();

        return findTableById(table.getId());
    }


    /**
     * Deletes an existing table record by its UUID.
     *
     * @param tableId UUID of the table to remove.
     */
    public void deleteTable(UUID tableId) {
        jdbcClient.sql("""
                DELETE FROM tbl_table
                WHERE id = :tableId
            """)
                .param("tableId", tableId)
                .update();
    }


    /**
     * Checks whether a table with the given ID exists and belongs to the specified user.
     *
     * @param tableId UUID of the table to check.
     * @param userId  UUID of the user who should own the table.
     * @return {@code true} if a row exists in {@code tbl_table} with {@code id = tableId}
     *         and {@code user_id = userId}; {@code false} otherwise.
     */
    public boolean tableExists(UUID tableId, UUID userId) {
        return jdbcClient.sql("""
                SELECT EXISTS(
                    SELECT 1
                    FROM tbl_table
                    WHERE id = :tableId and user_id = :userId
                )
            """)
                .param("tableId", tableId)
                .param("userId", userId)
                .query(Boolean.class)
                .single();
    }


    /**
     * Retrieves a full {@link TableProxy} object, including its rows and columns, for a given table UUID.
     *
     * @param tableId UUID of the table to fetch.
     * @return   {@link TableProxy} representing the table with populated proxies.
     */
    public TableProxy findTableById(UUID tableId) {
        return jdbcClient.sql("""
                SELECT *
                FROM tbl_table
                WHERE id = :tableId
            """)
                .param("tableId", tableId)
                .query(new TableMapper())
                .single();
    }


    public List<TableProxy> findByCreationDateAfter(UUID tableId, int quantity, UUID userId) {
        LocalDateTime date = jdbcClient.sql("""
                        SELECT creation_date
                        FROM tbl_table
                        WHERE id = :id AND user_id = :userId
                        """)
                .param("id", tableId)
                .param("userId", userId)
                .query(LocalDateTime.class)
                .single();

        return jdbcClient.sql("""
                        SELECT *
                        FROM tbl_table
                        WHERE creation_date < :date AND user_id = :userId
                        ORDER BY creation_date DESC
                        LIMIT :quantity
                        """)
                .param("date", date)
                .param("quantity", quantity)
                .param("userId", userId)
                .query(new TableMapper())
                .list();
    }

    public List<TableProxy> findLast(int quantity, UUID userId) {
        return jdbcClient.sql("""
                        SELECT *
                        FROM tbl_table
                        WHERE user_id = :userId
                        ORDER BY creation_date DESC
                        LIMIT :quantity
                        """)
                .param("quantity", quantity)
                .param("userId", userId)
                .query(new TableMapper())
                .list();
    }


    public void update(Table table) {
        jdbcClient.sql("""
                        UPDATE tbl_table
                        SET title = :title, description = :description, last_edit_date = :lastEditDate
                        WHERE id = :id
                        """)
                .param("id", table.getId())
                .param("title", table.getTitle())
                .param("description", table.getDescription())
                .param("lastEditDate", table.getLastEditDate())
                .update();
    }


    public List<TableProxy> findPaginated(int page, int pageSize, UUID userId) {
        int offset = page * pageSize;
        return jdbcClient.sql("""
                        SELECT *
                        FROM tbl_table
                        WHERE user_id = :userId
                        LIMIT :limit
                        OFFSET :offset
                        """)
                .param("limit", pageSize)
                .param("offset", offset)
                .param("userId", userId)
                .query(new TableMapper())
                .list();
    }


    private class TableMapper implements RowMapper<TableProxy> {

        @Override
        public TableProxy mapRow(ResultSet rs, int rowNum) throws SQLException {
            return new TableProxy(
                    UUID.fromString(rs.getString("id")),
                    rs.getString("title"),
                    rs.getString("description"),
                    rs.getTimestamp("creation_date").toLocalDateTime(),
                    rs.getTimestamp("last_edit_date").toLocalDateTime(),
                    UUID.fromString(rs.getString("user_id")),
                    rowDAO,
                    columnDAO
            );
        }
    }
}
