package com.github.bytestrick.tabula.service;

import com.github.bytestrick.tabula.repository.table.RowDAO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class RowService {

    private final RowDAO rowDAO;


}
