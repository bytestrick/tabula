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


    public void saveCell(int rowIndex, UUID columnId, String value) {
        jdbcClient.sql("INSERT INTO cell (id, row_index, my_column, value) VALUES (:id, :rowIndex, :myColumn, :value)")
                .param("id", UUID.randomUUID())
                .param("rowIndex", rowIndex)
                .param("myColumn", columnId)
                .param("value", value)
                .update();
    }


    public void updateCell(int rowIndex, UUID columnId, String newValue) {
        jdbcClient.sql("UPDATE cell SET value = :newValue WHERE row_index = :rowIndex and my_column = :columnId")
                .param("newValue", newValue)
                .param("rowIndex", rowIndex)
                .param("columnId", columnId)
                .update();
    }


    public void deleteCell(int rowIndex, UUID columnId) {
        jdbcClient.sql("DELETE FROM cell WHERE row_index = :rowIndex AND my_column IN (SELECT id FROM column WHERE table_id = :tableId")
                .param("rowIndex", rowIndex)
                .param("columnId", columnId)
                .update();
    }


    public List<Cell> findRowCells(UUID rowId) {
        return jdbcClient.sql("""
                SELECT *
                FROM cell
                WHERE my_row = :rowId
            """)
                .param("rowId", rowId)
                .query(new CellMapper()).list();
    }


    public List<Cell> findColumnCells(UUID columnId) {
        return jdbcClient.sql("""
                SELECT *
                FROM cell
                WHERE my_row = :columnId
            """)
                .param("columnId", columnId)
                .query(new CellMapper()).list();
    }


    private static class CellMapper implements RowMapper<Cell> {

        @Override
        public Cell mapRow(ResultSet rs, int rowNum) throws SQLException {
            return new Cell(
                    UUID.fromString(rs.getString("column_id")),
                    UUID.fromString(rs.getString("row_id")),
                    rs.getString("value")
            );
        }
    }
}
