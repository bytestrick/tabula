package com.github.bytestrick.tabula.repository.proxy.table;

import com.github.bytestrick.tabula.model.table.Cell;
import com.github.bytestrick.tabula.model.table.Row;
import com.github.bytestrick.tabula.repository.table.CellDAO;

import java.util.List;
import java.util.UUID;

/**
 * Proxy implementation of {@link Row} that supports lazy loading of cells.
 * <p>
 * Extends the base Row model and delegates retrieval of cell data to the provided {@code CellDAO}.
 * Cells are only fetched from the database when {@link #getCells()} is called and the internal list is null or empty.
 * </p>
 */
public class RowProxy extends Row {

    private final CellDAO cellDAO;


    /**
     * RowProxy constructor.
     *
     * @param id        UUID of the row.
     * @param myTable   UUID of the parent table.
     * @param rowIndex  Index of this row within the table.
     * @param cellDAO   DAO used to fetch cell data lazily.
     */
    public RowProxy(UUID id, UUID myTable, int rowIndex, CellDAO cellDAO) {
        super(id, myTable, rowIndex, null);

        this.cellDAO = cellDAO;
    }


    /**
     * Returns the list of cells for this row, loading them from the database if needed.
     * <p>
     * If no cells have been loaded yet or the current list is empty,
     * this method invokes {@code cellDAO.findRowCells(id)} to populate them.
     * </p>
     *
     * @return List of {@code Cell} objects belonging to this row.
     * @see CellDAO
     */
    @Override
    public List<Cell> getCells() {
        if (super.getCells() == null || super.getCells().isEmpty()) {
            super.setCells(cellDAO.findRowCells(super.getId()));
        }

        return super.getCells();
    }
}
