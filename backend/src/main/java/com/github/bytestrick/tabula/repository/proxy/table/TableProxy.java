package com.github.bytestrick.tabula.repository.proxy.table;

import com.github.bytestrick.tabula.model.table.Table;
import com.github.bytestrick.tabula.repository.table.ColumnDAO;
import com.github.bytestrick.tabula.repository.table.RowDAO;

import java.util.List;
import java.util.UUID;

public class TableProxy extends Table {

    private final RowDAO rowDAO;
    private final ColumnDAO columnDAO;


    public TableProxy(UUID id, RowDAO rowDAO, ColumnDAO columnDAO) {
        super(id, null, null);

        this.rowDAO = rowDAO;
        this.columnDAO = columnDAO;
    }


    @Override
    public List<ColumnProxy> getColumns() {
        if (super.getColumns() == null || super.getColumns().isEmpty()) {
            super.setColumns(columnDAO.findAllColumn(super.getId()));
        }

        return super.getColumns();
    }


    @Override
    public List<RowProxy> getRows() {
        if (super.getRows() == null || super.getRows().isEmpty()) {
            super.setRows(rowDAO.findAllRows(super.getId()));
        }

        return super.getRows();
    }
}
