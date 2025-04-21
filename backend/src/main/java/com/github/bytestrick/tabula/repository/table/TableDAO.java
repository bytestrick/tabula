package com.github.bytestrick.tabula.repository.table;

import com.github.bytestrick.tabula.repository.proxy.table.TableProxy;
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
public class TableDAO {

    private final JdbcClient jdbcClient;
    private final RowDAO rowDAO;
    private final ColumnDAO columnDAO;


    @Transactional
    public void saveTable(UUID id) {
        jdbcClient.sql("""
                INSERT INTO my_table (id)
                VALUES (:id)
            """)
                .param("id", id)
                .update();

        rowDAO.appendRow(id);
        columnDAO.appendColumn(id, columnDAO.findDataTypeIdByName("Textual"));
    }


    public void deleteTable(@NotNull UUID id) {
        jdbcClient.sql("""
                DELETE FROM my_table
                WHERE id = :id
            """)
                .param("id", id)
                .update();
    }


    public TableProxy findTable(@NotNull UUID id) {
        return jdbcClient.sql("""
                SELECT *
                FROM my_table
                WHERE id = :id
            """)
                .param("id", id)
                .query(new TableMapper())
                .single();
    }


    public List<String> getTableDataTypesNames(@NotNull UUID tableId) {
        return jdbcClient.sql("""
                SELECT d.name
                FROM my_column c
                JOIN data_type d ON c.data_type = d.id
                WHERE c.my_table = :tableId
                ORDER BY c.column_index
            """)
                .param("tableId", tableId)
                .query(String.class).list();
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
