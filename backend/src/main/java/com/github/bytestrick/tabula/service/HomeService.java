package com.github.bytestrick.tabula.service;

import com.github.bytestrick.tabula.controller.dto.TableCardDto;
import com.github.bytestrick.tabula.model.TableCard;
import com.github.bytestrick.tabula.model.User;
import com.github.bytestrick.tabula.repository.HomeDao;
import com.github.bytestrick.tabula.repository.UserDao;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class HomeService {

    private final UserDao userDao;
    private final HomeDao homeDao;
    private final FuzzySearchTableCard fuzzySearchTableCard;


    public User getAuthUser() {
        Authentication authentication = isAuthenticate();
        String email = authentication.getName();

        return userDao.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));
    }

    private Authentication isAuthenticate() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication != null)
            if (!authentication.isAuthenticated()) {
                String email = authentication.getName();
                throw new UsernameNotFoundException("User not found: " + email);
            }

        return authentication;
    }

    private TableCardDto toTableCardDto(TableCard tableCard) {
        return new TableCardDto(
                tableCard.getId(),
                tableCard.getTitle(),
                tableCard.getDescription(),
                tableCard.getCreationDate(),
                tableCard.getLastEditDate()
        );
    }

    public List<TableCardDto> getNextTableCard(UUID id, int quantity) {
        return homeDao.findByCreationDateAfter(id, quantity, getAuthUser().getId())
                .stream().map(this::toTableCardDto).toList();
    }

    public List<TableCardDto> getLastTableCard(int quantity) {
        return homeDao.findLast(quantity, getAuthUser().getId())
                .stream().map(this::toTableCardDto).toList();
    }

    public TableCardDto createTableCard(TableCard tableCard) {
        return toTableCardDto(homeDao.saveTableCard(tableCard, getAuthUser().getId()));
    }

    public String updateTableCard(TableCard tableCard) {
        isAuthenticate();
        homeDao.updateTableCard(tableCard);
        return "TableCard updated successfully";
    }

    public String deleteTableCard(UUID id) {
        isAuthenticate();
        homeDao.deleteTableCardById(id);
        return "TableCard deleted successfully";
    }

    public List<TableCardDto> fuzzySearch(String pattern) {
        return fuzzySearchTableCard.fuzzySearch(pattern, getAuthUser().getId())
                .stream().map(this::toTableCardDto).toList();
    }
}
