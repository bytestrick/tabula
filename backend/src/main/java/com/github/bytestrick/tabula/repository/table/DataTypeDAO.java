package com.github.bytestrick.tabula.repository.table;

import com.github.bytestrick.tabula.model.table.DataType;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
@RequiredArgsConstructor
public class DataTypeDAO {

    private final JdbcClient jdbcClient;


    public void save(@NotNull String name) {
        jdbcClient.sql("INSERT INTO data_type (name) VALUES (:name)")
                .param("name", name).update();
    }


    public List<DataType> findAll() {
        return jdbcClient.sql("SELECT * FROM data_type")
                .query(DataType.class)
                .list();
    }


    public DataType findByName(@NotNull String name) {
        return jdbcClient.sql("SELECT * FROM data_type WHERE name = :name")
                .param("name", name)
                .query(DataType.class)
                .single();
    }
}
