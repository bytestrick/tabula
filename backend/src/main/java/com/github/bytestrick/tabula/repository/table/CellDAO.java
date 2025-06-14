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
                WHERE tbl_row = :rowId and tbl_column = :columnId
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
                SELECT tbl_column
                FROM cell
                WHERE tbl_row = :rowId
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
                SELECT tbl_row
                FROM cell
                WHERE tbl_column = :columnId
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
                INNER JOIN tbl_column mc on mc.id = c.tbl_column
                WHERE c.tbl_row = :rowId
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
                INNER JOIN tbl_row mr on mr.id = c.tbl_row
                WHERE c.tbl_column = :columnId
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
                WHERE tbl_column = :columnId
            """)
                .param("columnId", columnId)
                .update();
    }

    /**
     * Updates the value of a cell in a specific row.
     *
     * @param rowId       UUID of the row containing the cell to update.
     * @param columnIndex Zero-based index of the column within that row.
     * @param value       New string value to set in the cell.
     */
    public void setRowCellValue(UUID rowId, int columnIndex, String value) {
        jdbcClient.sql("""
                UPDATE cell
                SET value = :newValue
                WHERE tbl_row = :rowId AND tbl_column = (SELECT id
                                                         FROM tbl_column
                                                         WHERE column_index = :columnIndex)
            """)
                .param("rowId", rowId)
                .param("columnIndex", columnIndex)
                .param("newValue", value)
                .update();
    }

    /**
     * Updates the value of a cell in a specific column.
     *
     * @param columnId UUID of the column containing the cell to update.
     * @param rowIndex Zero-based index of the row within that column.
     * @param value    New string value to set in the cell.
     */
    public void setColumnCellValue(UUID columnId, int rowIndex, String value) {
        jdbcClient.sql("""
                UPDATE cell
                SET value = :newValue
                WHERE tbl_column = :columnId AND tbl_row = (SELECT id
                                                            FROM tbl_row
                                                            WHERE row_index = :rowIndex)
            """)
                .param("columnId", columnId)
                .param("rowIndex", rowIndex)
                .param("newValue", value)
                .update();
    }

    private static class CellMapper implements RowMapper<Cell> {

        @Override
        public Cell mapRow(ResultSet rs, int rowNum) throws SQLException {
            return new Cell(
                    UUID.fromString(rs.getString("id")),
                    UUID.fromString(rs.getString("tbl_column")),
                    UUID.fromString(rs.getString("tbl_row")),
                    rs.getString("value")
            );
        }
    }
}
