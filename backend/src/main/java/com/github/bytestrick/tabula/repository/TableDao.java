package com.github.bytestrick.tabula.repository;

import com.github.bytestrick.tabula.model.Table;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class TableDao {

    private final JdbcClient jdbcClient;


    public List<Table> findByCreationDateAfter(UUID tableId, int quantity, UUID userId) {
        LocalDateTime date = jdbcClient.sql("""
                        SELECT creation_date
                        FROM tbl_table
                        WHERE id = :id AND user_id = :userId
                        """)
                .param("id", tableId)
                .param("userId", userId)
                .query(LocalDateTime.class)
                .single();

        return jdbcClient.sql("""
                        SELECT *
                        FROM tbl_table
                        WHERE creation_date < :date AND user_id = :userId
                        ORDER BY creation_date DESC
                        LIMIT :quantity
                        """)
                .param("date", date)
                .param("quantity", quantity)
                .param("userId", userId)
                .query(Table.class)
                .list();
    }

    public List<Table> findLast(int quantity, UUID userId) {
        return jdbcClient.sql("""
                        SELECT *
                        FROM tbl_table
                        WHERE user_id = :userId
                        ORDER BY creation_date DESC
                        LIMIT :quantity
                        """)
                .param("quantity", quantity)
                .param("userId", userId)
                .query(Table.class)
                .list();
    }

    public Table save(Table table, UUID userId) {
        UUID uuid = UUID.randomUUID();
        jdbcClient.sql("""
                        INSERT INTO tbl_table (id, title, description, creation_date, last_edit_date, user_id)
                        VALUES (:id, :title, :description, :creationDate, :lastEditDate, :userId)
                        """)
                .param("id", uuid)
                .param("title", table.getTitle())
                .param("description", table.getDescription())
                .param("creationDate", table.getCreationDate())
                .param("lastEditDate", table.getLastEditDate())
                .param("userId", userId)
                .update();
        return findById(uuid);
    }

    public void update(Table table) {
        jdbcClient.sql("""
                        UPDATE tbl_table
                        SET title = :title, description = :description, last_edit_date = :lastEditDate
                        WHERE id = :id
                        """)
                .param("id", table.getId())
                .param("title", table.getTitle())
                .param("description", table.getDescription())
                .param("lastEditDate", table.getLastEditDate())
                .update();
    }

    public Table findById(UUID tableId) {
        return jdbcClient.sql("""
                        SELECT *
                        FROM tbl_table
                        WHERE id = :tableId
                        """)
                .param("tableId", tableId)
                .query(Table.class)
                .single();
    }

    public void deleteById(UUID tableId) {
        jdbcClient.sql("""
                        DELETE FROM tbl_table
                        WHERE id = :tableId
                        """)
                .param("tableId", tableId)
                .update();
    }

    public List<Table> findPaginated(int page, int pageSize, UUID userId) {
        int offset = page * pageSize;
        return jdbcClient.sql("""
                        SELECT *
                        FROM tbl_table
                        WHERE user_id = :userId
                        LIMIT :limit
                        OFFSET :offset
                        """)
                .param("limit", pageSize)
                .param("offset", offset)
                .param("userId", userId)
                .query(Table.class)
                .list();
    }
}

