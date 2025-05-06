package com.github.bytestrick.tabula.repository.table;

import com.github.bytestrick.tabula.model.table.Cell;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;
import java.util.UUID;

@RequiredArgsConstructor
@Repository
public class CellDAO {

    private final JdbcClient jdbcClient;


    /**
     * Updates the value of a single cell identified by its row and column UUIDs.
     *
     * @param rowId     UUID of the row containing the cell.
     * @param columnId  UUID of the column containing the cell.
     * @param newValue  New string value to set in the cell.
     */
    public void updateCell(UUID rowId, UUID columnId, String newValue) {
        jdbcClient.sql("""
                UPDATE cell
                SET value = :newValue
                WHERE my_row = :rowId and my_column = :columnId
            """)
                .param("newValue", newValue)
                .param("rowId", rowId)
                .param("columnId", columnId)
                .update();
    }


    /**
     * Retrieves the IDs of all columns that have cells in the given row.
     *
     * @param rowId
     *   UUID of the row whose column IDs are to be fetched.
     * @return
     *   List of UUIDs representing each column that has a cell in the specified row.
     */
    public List<UUID> findRowCellsColumnsIds(UUID rowId) {
        return jdbcClient.sql("""
                SELECT my_column
                FROM cell
                WHERE my_row = :rowId
            """)
                .param("rowId", rowId)
                .query(UUID.class)
                .list();
    }


    /**
     * Retrieves the IDs of all rows that have cells in the given column.
     *
     * @param columnId
     *   UUID of the column whose row IDs are to be fetched.
     * @return
     *   List of UUIDs representing each row that has a cell in the specified column.
     */
    public List<UUID> findColumnCellsRowsIds(UUID columnId) {
        return jdbcClient.sql("""
                SELECT my_row
                FROM cell
                WHERE my_column = :columnId
            """)
                .param("columnId", columnId)
                .query(UUID.class)
                .list();
    }



    /**
     * Retrieves all cells belonging to a specific row, ordered by their column index.
     *
     * @param rowId UUID of the row whose cells are to be fetched.
     * @return      List of {@link Cell} objects in ascending order of their column positions.
     */
    public List<Cell> findRowCells(UUID rowId) {
        return jdbcClient.sql("""
                SELECT c.*
                FROM cell c
                INNER JOIN my_column mc on mc.id = c.my_column
                WHERE c.my_row = :rowId
                ORDER BY mc.column_index
            """)
                .param("rowId", rowId)
                .query(new CellMapper()).list();
    }


    /**
     * Retrieves all cells belonging to a specific column, ordered by their row index.
     *
     * @param columnId UUID of the column whose cells are to be fetched.
     * @return         List of {@link Cell} objects in ascending order of their row positions.
     */
    public List<Cell> findColumnCells(UUID columnId) {
        return jdbcClient.sql("""
                SELECT c.*
                FROM cell c
                INNER JOIN my_row mr on mr.id = c.my_row
                WHERE c.my_column = :columnId
                ORDER BY mr.row_index
            """)
                .param("columnId", columnId)
                .query(new CellMapper()).list();
    }


    /**
     * Resets the value of all cells in a given column to the empty string.
     *
     * @param columnId
     *   UUID of the column whose cells should be cleared.
     */
    public void resetColumnCellsValues(UUID columnId) {
        jdbcClient.sql("""
                UPDATE cell
                SET value = ''
                WHERE my_column = :columnId
            """)
                .param("columnId", columnId)
                .update();
    }


    private static class CellMapper implements RowMapper<Cell> {

        @Override
        public Cell mapRow(ResultSet rs, int rowNum) throws SQLException {
            return new Cell(
                    UUID.fromString(rs.getString("id")),
                    UUID.fromString(rs.getString("my_column")),
                    UUID.fromString(rs.getString("my_row")),
                    rs.getString("value")
            );
        }
    }
}
