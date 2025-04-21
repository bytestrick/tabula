package com.github.bytestrick.tabula.repository.proxy.table;

import com.github.bytestrick.tabula.model.table.Cell;
import com.github.bytestrick.tabula.model.table.Column;
import com.github.bytestrick.tabula.repository.table.CellDAO;

import java.util.List;
import java.util.UUID;

public class ColumnProxy extends Column {

    private final CellDAO cellDAO;


    public ColumnProxy(UUID id, UUID myTable, UUID dataType, int columnIndex, CellDAO cellDAO) {
        super(id, myTable, dataType, columnIndex, null);

        this.cellDAO = cellDAO;
    }


    @Override
    public List<Cell> getCells() {
        if (super.getCells() == null || super.getCells().isEmpty()) {
            super.setCells(cellDAO.findColumnCells(super.getId()));
        }

        return super.getCells();
    }
}
