package com.github.bytestrick.tabula.repository;

import com.github.bytestrick.tabula.model.TableCard;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public class HomeDao {
    private final JdbcClient jdbcClient;

    public HomeDao(JdbcClient jdbcClient) {
        this.jdbcClient = jdbcClient;
    }

    public List<TableCard> findTableCardPaginated(int page, int size) {
        return jdbcClient.sql("SELECT * FROM table_card LIMIT :size OFFSET :offset")
                .param("size", size)
                .param("offset", page * size)
                .query(TableCard.class)
                .list();
    }

    public TableCard saveTableCard(TableCard tableCard) {
        UUID uuid = UUID.randomUUID();
        jdbcClient.sql("INSERT INTO table_card VALUES (:id, :title, :description)")
                .param("id", uuid)
                .param("title", tableCard.getTitle())
                .param("description", tableCard.getDescription())
                .update();
        return findTableCardById(uuid);
    }

    public void updateTableCard(TableCard tableCard) {
        jdbcClient.sql("UPDATE table_card SET title = :title, description = :description WHERE id = :id")
                .param("title", tableCard.getTitle())
                .param("description", tableCard.getDescription())
                .param("id", tableCard.getId())
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
}

