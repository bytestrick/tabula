package com.github.bytestrick.tabula.repository.proxy.table;

import com.github.bytestrick.tabula.model.table.Cell;
import com.github.bytestrick.tabula.model.table.Row;
import com.github.bytestrick.tabula.repository.table.CellDAO;

import java.util.List;
import java.util.UUID;

public class RowProxy extends Row {

    private final CellDAO cellDAO;


    public RowProxy(UUID id, UUID myTable, int rowIndex, CellDAO cellDAO) {
        super(id, myTable, rowIndex, null);

        this.cellDAO = cellDAO;
    }


    @Override
    public List<Cell> getCells() {
        if (super.getCells() == null || super.getCells().isEmpty()) {
            super.setCells(cellDAO.findRowCells(super.getId()));
        }

        return super.getCells();
    }
}
