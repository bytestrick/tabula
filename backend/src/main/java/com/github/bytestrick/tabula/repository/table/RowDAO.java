package com.github.bytestrick.tabula.repository.table;

import com.github.bytestrick.tabula.repository.proxy.table.RowProxy;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;
import java.util.UUID;

@RequiredArgsConstructor
@Repository
public class RowDAO {

    private final JdbcClient jdbcClient;
    private final CellDAO cellDAO;


    public void saveRow(int rowIndex, @NotNull UUID dataType, @NotNull UUID tableId) {
        jdbcClient.sql("""
                INSERT INTO my_row (id, my_table, row_index)
                VALUES (:id, :table, :rowIndex)
            """)
                .param("id", UUID.randomUUID())
                .param("table", tableId)
                .param("rowIndex", rowIndex)
                .update();
    }


    @Transactional
    public void deleteRow(int rowIndex, @NotNull UUID tableId) {
        jdbcClient.sql("""
                DELETE FROM my_row
                WHERE row_index = :rowIndex AND my_table = :tableId
            """)
                .param("rowIndex", rowIndex)
                .param("tableId", tableId)
                .update();

        jdbcClient.sql("""
                UPDATE my_row
                SET row_index = row_index - 1
                WHERE row_index > :rowIndex AND my_table = :tableId
            """)
                .param("rowIndex", rowIndex)
                .param("tableId", tableId)
                .update();
    }


    public void updateRowCells(int rowIndex, String newValue, @NotNull UUID tableId) {
        jdbcClient.sql("""
                UPDATE cell
                SET value = :newValue
                WHERE my_row = (
                    SELECT id
                    FROM my_row
                    WHERE row_index = :rowIndex AND my_table = :tableId
                )
            """)
                .param("newValue", newValue)
                .param("rowIndex", rowIndex)
                .param("tableId", tableId)
                .update();
    }


    public void appendRow(@NotNull UUID tableId) {
        jdbcClient.sql("""
                INSERT INTO my_row (id, my_table, row_index)
                VALUES (:id, :tableId,
                    (SELECT COALESCE(MAX(row_index), -1) + 1
                     FROM my_row
                     WHERE my_table = :tableId))
            """)
                .param("id", UUID.randomUUID())
                .param("tableId", tableId)
                .update();
    }


    public List<RowProxy> findAllRows(@NotNull UUID tableId) {
        return jdbcClient.sql("""
                SELECT *
                FROM my_row
                WHERE my_table = :tableId
                ORDER BY row_index
            """)
                .param("tableId", tableId)
                .query(new MyRowMapper()).list();
    }


    public UUID findRowIdByIndex(@NotNull UUID tableId, int rowIndex) {
        return jdbcClient.sql("""
                SELECT id
                FROM my_row
                WHERE my_table = :tableId AND row_index = :rowIndex
            """)
                .param("tableId", tableId)
                .param("rowIndex", rowIndex)
                .query(UUID.class)
                .single();
    }


    public void updateRowIndex(@NotNull UUID rowId, int newRowIndex, @NotNull UUID tableId) {
        jdbcClient.sql("""
                UPDATE my_row
                SET row_index = :newRowIndex
                WHERE id = :rowId AND my_table = :tableId;
            """)
                .param("newRowIndex", newRowIndex)
                .param("tableId", tableId)
                .param("rowId", rowId)
                .update();
    }


    private class MyRowMapper implements RowMapper<RowProxy> {

        @Override
        public RowProxy mapRow(ResultSet rs, int rowNum) throws SQLException {
            return new RowProxy(
                    UUID.fromString(rs.getString("id")),
                    UUID.fromString(rs.getString("my_table")),
                    rs.getInt("row_index"),
                    cellDAO
            );
        }
    }
}
