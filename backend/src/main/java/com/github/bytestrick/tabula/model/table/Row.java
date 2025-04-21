package com.github.bytestrick.tabula.model.table;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
@AllArgsConstructor
public class Row {

    private UUID id;
    private UUID myTable;
    private int rowIndex;
    private List<Cell> cells;
}
