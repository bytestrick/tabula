package com.github.bytestrick.tabula.model.table;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
@AllArgsConstructor
public class Column {

    private UUID id;
    private UUID myTable;
    private UUID dataType;
    private int columnIndex;
    private List<Cell> cells;
}
