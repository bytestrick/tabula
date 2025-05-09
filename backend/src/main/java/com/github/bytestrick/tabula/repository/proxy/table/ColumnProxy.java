package com.github.bytestrick.tabula.repository.proxy.table;

import com.github.bytestrick.tabula.model.table.Cell;
import com.github.bytestrick.tabula.model.table.Column;
import com.github.bytestrick.tabula.repository.table.CellDAO;

import java.util.List;
import java.util.UUID;

/**
 * Proxy implementation of {@link Column} that supports lazy loading of cells.
 * <p>
 * Extends the base Column model and delegates retrieval of cell data to the provided {@link CellDAO}.
 * Cells are only fetched from the database when {@link #getCells()} is called and the internal list is null or empty.
 * </p>
 */
public class ColumnProxy extends Column {

    private final CellDAO cellDAO;


    /**
     * ColumnProxy constructor.
     *
     * @param id           UUID of the column.
     * @param myTable      UUID of the parent table.
     * @param dataTypeId   Integer identifier of the column's data type.
     * @param name         Name of the column.
     * @param columnIndex  Index of this column within the table.
     * @param cellDAO      DAO used to fetch cell data lazily.
     */
    public ColumnProxy(UUID id, UUID myTable, int dataTypeId, String name, int columnIndex, CellDAO cellDAO) {
        super(id, myTable, dataTypeId, name, columnIndex, null);

        this.cellDAO = cellDAO;
    }


    /**
     * Returns the list of cells for this column, loading them from the database if needed.
     * <p>
     * If no cells have been loaded yet or the current list is empty,
     * this method invokes {@code cellDAO.findColumnCells(id)} to populate them.
     * </p>
     *
     * @return List of {@link Cell} objects belonging to this column.
     */
    @Override
    public List<Cell> getCells() {
        if (super.getCells() == null || super.getCells().isEmpty()) {
            super.setCells(cellDAO.findColumnCells(super.getId()));
        }

        return super.getCells();
    }
}
