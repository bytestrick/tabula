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


    /**
     * Retrieves all data types available in the system.
     *
     * @return list of {@link DataType} objects representing each row in the data_type table.
     */
    public List<DataType> findAll() {
        return jdbcClient.sql("SELECT * FROM data_type")
                .query(DataType.class)
                .list();
    }


    /**
     * Finds a single data type by its unique name.
     *
     * @param name non-null name of the data type to retrieve.
     * @return the {@link DataType} object matching the given name.
     */
    public DataType findByName(@NotNull String name) {
        return jdbcClient.sql("SELECT * FROM data_type WHERE name = :name")
                .param("name", name)
                .query(DataType.class)
                .single();
    }


    /**
     * Retrieves the integer ID of a data type given its name.
     *
     * @param dataTypeName name of the data type to lookup.
     * @return integer ID corresponding to the data type.
     */
    public int findDataTypeIdByName(String dataTypeName) {
        return jdbcClient.sql("""
                SELECT id
                FROM data_type
                WHERE name = :dataTypeName
            """)
                .param("dataTypeName", dataTypeName)
                .query(Integer.class)
                .single();
    }


    /**
     * Check to see if a dataType exists.
     *
     * @param dataTypeId Id to check.
     * @return {@code true} if the {@code dataTypeId} is associated with a data type.
     */
    public boolean dataTypeExists(int dataTypeId) {
        return jdbcClient.sql("""
                SELECT EXISTS(
                    SELECT 1
                    FROM data_type
                    WHERE id = :dataTypeId
                )
            """)
                .param("dataTypeId", dataTypeId)
                .query(Boolean.class)
                .single();
    }
}
