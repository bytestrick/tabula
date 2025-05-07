package com.github.bytestrick.tabula.repository.table;

import com.github.bytestrick.tabula.repository.proxy.table.TableProxy;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.UUID;

/**
 * Handles operations related to the 'my_table' table.
 * <p>
 * Database Notes:
 *   <ul>
 *      <li>The 'my_table' table is referenced by 'my_column' and 'my_row'.</li>
 *      <li>
 *          Both references have the foreign key constraint: ON DELETE CASCADE.
 *          This means that deleting a record from 'my_table' will automatically delete
 *          the corresponding rows from 'my_column' and 'my_row'.
 *      </li>
 *      <li>
 *          The 'cell' table references both 'my_row' and 'my_column' with
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
    private final RowDAO rowDAO;
    private final ColumnDAO columnDAO;


    /**
     * Persists a new table record with the given UUID.
     *
     * @param id UUID of the new table to insert.
     */
    public void saveTable(UUID id) {
        jdbcClient.sql("""
                INSERT INTO tbl_table (id)
                VALUES (:id)
            """)
                .param("id", id)
                .update();
    }


    /**
     * Deletes an existing table record by its UUID.
     *
     * @param id UUID of the table to remove.
     */
    public void deleteTable(UUID id) {
        jdbcClient.sql("""
                DELETE FROM tbl_table
                WHERE id = :id
            """)
                .param("id", id)
                .update();
    }


    /**
     * Check to see if the table exists.
     *
     * @param tableId Id to check.
     * @return Returns {@code true} if the {@code tableId} is associated with a table.
     */
    public boolean tableExists(UUID tableId) {
        return jdbcClient.sql("""
                SELECT EXISTS(
                    SELECT 1
                    FROM tbl_table
                    WHERE id = :tableId
                )
            """)
                .param("tableId", tableId)
                .query(Boolean.class)
                .single();
    }


    /**
     * Retrieves a full {@link TableProxy} object, including its rows and columns, for a given table UUID.
     *
     * @param id UUID of the table to fetch.
     * @return   {@link TableProxy} representing the table with populated proxies.
     */
    public TableProxy findTable(UUID id) {
        return jdbcClient.sql("""
                SELECT *
                FROM tbl_table
                WHERE id = :id
            """)
                .param("id", id)
                .query(new TableMapper())
                .single();
    }


    private class TableMapper implements RowMapper<TableProxy> {

        @Override
        public TableProxy mapRow(ResultSet rs, int rowNum) throws SQLException {
            return new TableProxy(
                    UUID.fromString(rs.getString("id")),
                    rowDAO,
                    columnDAO
            );
        }
    }
}
