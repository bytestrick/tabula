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


    public void saveCell(int rowId, UUID columnId, String value) {
        jdbcClient.sql("INSERT INTO cell (id, my_row, my_column, value) VALUES (:id, :rowId, :myColumn, :value)")
                .param("id", UUID.randomUUID())
                .param("rowId", rowId)
                .param("myColumn", columnId)
                .param("value", value)
                .update();
    }


    public void updateCell(UUID rowId, UUID columnId, String newValue) {
        jdbcClient.sql("UPDATE cell SET value = :newValue WHERE my_row = :rowId and my_column = :columnId")
                .param("newValue", newValue)
                .param("rowId", rowId)
                .param("columnId", columnId)
                .update();
    }


    public void deleteCell(UUID rowId, UUID columnId) {
        jdbcClient.sql("DELETE FROM cell WHERE my_row = :rowId AND my_column = :columnId")
                .param("rowId", rowId)
                .param("columnId", columnId)
                .update();
    }


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


    private static class CellMapper implements RowMapper<Cell> {

        @Override
        public Cell mapRow(ResultSet rs, int rowNum) throws SQLException {
            return new Cell(
                    UUID.fromString(rs.getString("my_column")),
                    UUID.fromString(rs.getString("my_row")),
                    rs.getString("value")
            );
        }
    }
}
