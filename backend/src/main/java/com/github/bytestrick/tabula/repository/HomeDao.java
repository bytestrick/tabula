package com.github.bytestrick.tabula.repository;

import com.github.bytestrick.tabula.model.Table;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class HomeDao {

    private final JdbcClient jdbcClient;


    public List<Table> findByCreationDateAfter(UUID tableCardId, int quantity, UUID userId) {
        LocalDateTime date = jdbcClient.sql("SELECT creation_date FROM table_card WHERE id = :id AND user_id = :userId")
                .param("id", tableCardId)
                .param("userId", userId)
                .query(LocalDateTime.class)
                .single();

        return jdbcClient.sql("SELECT * FROM table_card WHERE creation_date < :date AND user_id = :userId ORDER BY creation_date DESC LIMIT :quantity")
                .param("date", date)
                .param("quantity", quantity)
                .param("userId", userId)
                .query(Table.class)
                .list();
    }

    public List<Table>findLast(int quantity, UUID userId) {
        return jdbcClient.sql("SELECT * FROM table_card WHERE user_id = :userId ORDER BY creation_date DESC LIMIT :quantity")
                .param("quantity", quantity)
                .param("userId", userId)
                .query(Table.class)
                .list();
    }

    public Table saveTableCard(Table tableCard, UUID userId, UUID tableId) {
        UUID uuid = UUID.randomUUID();
        jdbcClient.sql("INSERT INTO table_card (id, title, description, creation_date, last_edit_date, user_id, table_id) VALUES (:id, :title, :description, :creationDate, :lastEditDate, :userId, :tableId)")
                .param("id", uuid)
                .param("title", tableCard.getTitle())
                .param("description", tableCard.getDescription())
                .param("creationDate", tableCard.getCreationDate())
                .param("lastEditDate", tableCard.getLastEditDate())
                .param("userId", userId)
                .param("tableId", tableId)
                .update();
        return findTableCardById(uuid);
    }

    public void updateTableCard(Table tableCard) {
        jdbcClient.sql("UPDATE table_card SET title = :title, description = :description, last_edit_date = :lastEditDate WHERE id = :id")
                .param("id", tableCard.getId())
                .param("title", tableCard.getTitle())
                .param("description", tableCard.getDescription())
                .param("lastEditDate", tableCard.getLastEditDate())
                .update();
    }

    public Table findTableCardById(UUID tableCardId) {
        return jdbcClient.sql("SELECT * FROM table_card WHERE id = :tableCardId")
                .param("tableCardId", tableCardId)
                .query(Table.class)
                .single();
    }

    public void deleteTableCardById(UUID tableCardId) {
        jdbcClient.sql("DELETE FROM table_card WHERE id = :tableCardId")
                .param("tableCardId", tableCardId)
                .update();
    }

    public List<Table> findTableCardPaginated(int page, int pageSize, UUID userId) {
        int offset = page * pageSize;
        return jdbcClient.sql("SELECT * FROM table_card WHERE user_id = :userId LIMIT :limit OFFSET :offset")
                .param("limit", pageSize)
                .param("offset", offset)
                .param("userId", userId)
                .query(Table.class)
                .list();
    }


    public Boolean userHasTable(@NotNull UUID userId, @NotNull UUID tableId) {
        return jdbcClient.sql("""
            SELECT EXISTS (
                SELECT 1
                FROM table_card
                WHERE user_id = :userId AND table_id = :tableId
            )
            """)
                .param("userId", userId)
                .param("tableId", tableId)
                .query(Boolean.class)
                .single();
    }
}

