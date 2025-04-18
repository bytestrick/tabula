package com.github.bytestrick.tabula.repository;

import com.github.bytestrick.tabula.model.TableCard;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public class HomeDao {
    private final JdbcClient jdbcClient;

    public HomeDao(JdbcClient jdbcClient) {
        this.jdbcClient = jdbcClient;
    }

    public List<TableCard> findByCreationDateAfter(UUID id, int quantity) {
        LocalDateTime date = jdbcClient.sql("SELECT creation_date FROM table_card WHERE id = :id")
                .param("id", id)
                .query(LocalDateTime.class)
                .single();

        return jdbcClient.sql("SELECT * FROM table_card WHERE creation_date < :date ORDER BY creation_date DESC LIMIT :quantity")
                .param("date", date)
                .param("quantity", quantity)
                .query(TableCard.class)
                .list();
    }

    public List<TableCard>findLast(int quantity) {
        return jdbcClient.sql("SELECT * FROM table_card  ORDER BY creation_date DESC LIMIT :quantity")
                .param("quantity", quantity)
                .query(TableCard.class)
                .list();
    }

    public TableCard saveTableCard(TableCard tableCard) {
        UUID uuid = UUID.randomUUID();
        jdbcClient.sql("INSERT INTO table_card VALUES (:id, :title, :description, :creationDate, :lastEditDate)")
                .param("id", uuid)
                .param("title", tableCard.getTitle())
                .param("description", tableCard.getDescription())
                .param("creationDate", tableCard.getCreationDate())
                .param("lastEditDate", tableCard.getLastEditDate())
                .update();
        return findTableCardById(uuid);
    }

    public void updateTableCard(TableCard tableCard) {
        jdbcClient.sql("UPDATE table_card SET title = :title, description = :description, last_edit_date = :lastEditDate WHERE id = :id")
                .param("id", tableCard.getId())
                .param("title", tableCard.getTitle())
                .param("description", tableCard.getDescription())
                .param("lastEditDate", tableCard.getLastEditDate())
                .update();
    }

    public TableCard findTableCardById(UUID id) {
        return jdbcClient.sql("SELECT * FROM table_card WHERE id = :id")
                .param("id", id)
                .query(TableCard.class)
                .single();
    }

    public void deleteTableCardById(UUID id) {
        jdbcClient.sql("DELETE FROM table_card WHERE id = :id")
                .param("id", id)
                .update();
    }

    public List<TableCard> findTableCardPaginated(int page, int pageSize) {
        int offset = page * pageSize;
        return jdbcClient.sql("SELECT * FROM table_card LIMIT :limit OFFSET :offset")
                .param("limit", pageSize)
                .param("offset", offset)
                .query(TableCard.class)
                .list();
    }
}

