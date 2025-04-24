package com.github.bytestrick.tabula.repository.table;

import com.github.bytestrick.tabula.repository.proxy.table.ColumnProxy;
import jakarta.validation.constraints.NotNull;
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
public class ColumnDAO {

    private final JdbcClient jdbcClient;
    private final CellDAO cellDAO;


    public void saveColumn(int columnIndex, int dataTypeId, @NotNull UUID tableId) {
        jdbcClient.sql("INSERT INTO my_column (id, my_table, data_type, column_index) VALUES (:id, :table, :dataTypeId, :columnIndex)")
                .param("id", UUID.randomUUID())
                .param("table", tableId)
                .param("dataTypeId", dataTypeId)
                .param("columnIndex", columnIndex)
                .update();
    }


    public void updateColumnDatType(int columnIndex, int dataTypeId, @NotNull UUID tableId) {
        jdbcClient.sql("UPDATE my_column SET data_type = :dataTypeId WHERE column_index = :columnIndex and my_table = :tableId")
                .param("dataTypeId", dataTypeId)
                .param("columnIndex", columnIndex)
                .param("tableId", tableId)
                .update();
    }


    public void deleteColumn(int columnIndex, @NotNull UUID tableId) {
        jdbcClient.sql("DELETE FROM my_column WHERE column_index = :columnIndex and my_table = :tableId")
                .param("columnIndex", columnIndex)
                .param("tableId", tableId)
                .update();
    }


    public void updateColumnCells(@NotNull UUID columnId, String newValue) {
        jdbcClient.sql("UPDATE cell SET value = :newValue WHERE my_row = :columnIndex")
                .param("newValue", newValue)
                .param("columnIndex", columnId)
                .update();
    }


    public void appendColumn(@NotNull UUID tableId, int dataTypeId) {
        jdbcClient.sql("""
            INSERT INTO my_column (id, my_table, data_type, column_index)
            VALUES (:id, :tableId, :dataTypeId, (
                SELECT COALESCE(MAX(column_index), -1) + 1
                FROM my_column
                WHERE my_table = :tableId)
                )
        """)
                .param("id", UUID.randomUUID())
                .param("tableId", tableId)
                .param("dataTypeId", dataTypeId)
                .update();
    }


    public List<ColumnProxy> findAllColumn(@NotNull UUID tableId) {
        return jdbcClient.sql("""
                SELECT *
                FROM my_column
                WHERE my_table = :tableId
                ORDER BY column_index
            """)
                .param("tableId", tableId)
                .query(new ColumnMapper()).list();
    }


    public int findDataTypeIdByName(@NotNull String name) {
        return jdbcClient.sql("""
                SELECT id
                FROM data_type
                WHERE name = :name
            """)
                .param("name", name)
                .query(Integer.class)
                .single();
    }

    public void changeColumnDataType(@NotNull UUID tableId, int columnIndex, int dataTypeId) {
        System.out.printf("Changing column data type %d to %d\n", columnIndex, dataTypeId);
        jdbcClient.sql("""
                UPDATE my_column
                SET data_type = :dataTypeId
                WHERE column_index = :columnIndex AND my_table = :tableId
            """)
                .param("dataTypeId", dataTypeId)
                .param("columnIndex", columnIndex)
                .param("tableId", tableId)
                .update();
    }


    public UUID findColumnIdByIndex(@NotNull UUID tableId, int columnIndex) {
        return jdbcClient.sql("""
                SELECT id
                FROM my_column
                WHERE my_table = :tableId AND column_index = :columnIndex
            """)
                .param("tableId", tableId)
                .param("columnIndex", columnIndex)
                .query(UUID.class)
                .single();
    }


    private class ColumnMapper implements RowMapper<ColumnProxy> {

        @Override
        public ColumnProxy mapRow(ResultSet rs, int rowNum) throws SQLException {
            return new ColumnProxy(
                    UUID.fromString(rs.getString("id")),
                    UUID.fromString(rs.getString("my_table")),
                    rs.getInt("data_type"),
                    rs.getString("column_name"),
                    rs.getInt("column_index"),
                    cellDAO
            );
        }
    }
}
