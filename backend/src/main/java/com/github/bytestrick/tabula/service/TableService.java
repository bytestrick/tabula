package com.github.bytestrick.tabula.service;

import com.github.bytestrick.tabula.controller.dto.table.ColumnDTO;
import com.github.bytestrick.tabula.controller.dto.table.RowDTO;
import com.github.bytestrick.tabula.controller.dto.table.TableDTO;
import com.github.bytestrick.tabula.controller.dto.TableDto;
import com.github.bytestrick.tabula.model.Table;
import com.github.bytestrick.tabula.model.User;
import com.github.bytestrick.tabula.controller.dto.table.*;
import com.github.bytestrick.tabula.model.table.Cell;
import com.github.bytestrick.tabula.repository.TableDao;
import com.github.bytestrick.tabula.repository.UserDao;
import com.github.bytestrick.tabula.repository.proxy.table.ColumnProxy;
import com.github.bytestrick.tabula.repository.proxy.table.RowProxy;
import com.github.bytestrick.tabula.repository.proxy.table.TableProxy;
import com.github.bytestrick.tabula.repository.table.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TableService {

    private final UserDao userDao;
    private final TableDAO tableDAO;
    private final TableDao tableDao;
    private final FuzzySearchTable fuzzySearchTable;
    private final ColumnDAO columnDAO;
    private final RowDAO rowDAO;
    private final CellDAO cellDAO;
    private final DataTypeDAO dataTypeDAO;


    public User getAuthUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userDao.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));
    }

    private TableDto toTableCardDto(Table table) {
        return new TableDto(
                table.getId(),
                table.getTitle(),
                table.getDescription(),
                table.getCreationDate(),
                table.getLastEditDate(),
                table.getTableId()
        );
    }

    public List<TableDto> getNextTables(UUID id, int quantity) {
        return tableDao.findByCreationDateAfter(id, quantity, getAuthUser().getId())
                .stream().map(this::toTableCardDto).toList();
    }

    public List<TableDto> getLastTables(int quantity) {
        return tableDao.findLast(quantity, getAuthUser().getId())
                .stream().map(this::toTableCardDto).toList();
    }

    public TableDto createTable(Table table) {
        return toTableCardDto(tableDao.save(table, getAuthUser().getId()));
    }

    public String updateTable(Table table) {
        tableDao.update(table);
        return "TableCard updated successfully";
    }


    public List<TableDto> fuzzySearch(String pattern) {
        return fuzzySearchTable.fuzzySearch(pattern, getAuthUser().getId())
                .stream().map(this::toTableCardDto).toList();
    }



    /**
     * Creates a new table.
     *
     * <p>The method generates a new UUID for the table, append one row and
     * one column and persists it in the database.</p>
     *
     * @return the id (UUID) of the newly created table.
     */
    @Transactional
    public UUID createNewTable() {
        UUID newTableId = UUID.randomUUID();

        tableDAO.saveTable(newTableId);
        rowDAO.appendNewRow(newTableId, UUID.randomUUID());
        columnDAO.appendColumn(newTableId, UUID.randomUUID(), dataTypeDAO.findDataTypeIdByName("Textual"));

        return newTableId;
    }


    /**
     * Retrieves a complete table.
     *
     * <p>The method loads the table identified by the given {@code tableId}, extracts
     * all its columns and rows, and converts them into a structured {@link TableDTO}.</p>
     *
     * @param tableId the UUID of the table to retrieve.
     * @return a {@link TableDTO} representing the full state of the table, including header's columns and content.
     */
    @Transactional
    public TableDTO getTable(UUID tableId) {
        TableProxy table = tableDAO.findTable(tableId);
        List<RowDTO> content = new ArrayList<>();
        List<ColumnDTO> headers = new ArrayList<>();

        for (RowProxy row : table.getRows()) {
            List<CellDTO> cells = new ArrayList<>();

            for (Cell cell : row.getCells()) {
                cells.add(new CellDTO(table.getId(), cell.getRowId(), cell.getColumnId(), cell.getValue()));
            }

            content.add(new RowDTO(row.getId(), table.getId(), cells));
        }

        for (ColumnProxy column : table.getColumns()) {
            headers.add(
                   new ColumnDTO(column.getId(), table.getId(), column.getDataTypeId(), column.getName(), column.getColumnIndex())
            );
        }

        return new TableDTO(table.getId(), headers, content);
    }



    public String deleteTable(UUID tableCardId) {
        tableDAO.deleteTable(tableCardId);
        return "Table deleted successfully";
    }


    private RowProxy appendNewRow(UUID tableID) {
        return rowDAO.appendNewRow(tableID, UUID.randomUUID());
    }


    private RowProxy insertNewRowAt(UUID tableID, int rowIndex) {
        return rowDAO.insertNewRowAt(tableID, UUID.randomUUID(), rowIndex);
    }


    /**
     * Creates a new row in the specified table.
     *
     * <p>If the provided {@code rowIndex} in {@link RowCreateDTO} is {@code null},
     * the new row is appended at the end of the table. Otherwise, it is inserted
     * at the specified index.</p>
     *
     * @param tableId       The UUID of the table in which the new row should be added.
     * @param rowCreateDTO  DTO containing the optional row index.
     * @return              A {@link RowCreatedDTO} containing metadata of the newly created row.
     */
    public RowCreatedDTO addNewRow(UUID tableId, RowCreateDTO rowCreateDTO) {
        RowProxy createRow;

        if (rowCreateDTO.rowIndex() == null)
            createRow = appendNewRow(tableId);
        else
            createRow = insertNewRowAt(tableId, rowCreateDTO.rowIndex());

        return new RowCreatedDTO(
                createRow.getId(),
                createRow.getMyTable(),
                createRow.getRowIndex()
        );
    }


    private ColumnProxy appendNewColumn(UUID tableID, int dataType) {
        return columnDAO.appendColumn(tableID, UUID.randomUUID(), dataType);
    }


    private ColumnProxy insertColumnAt(UUID tableID, int dataType, int columnIndex) {
        return columnDAO.insertColumnAt(tableID, UUID.randomUUID(), dataType, columnIndex);
    }


    /**
     * Creates a new column in the specified table.
     *
     * <p>If {@code columnIndex} in {@link ColumnCreateDTO} is {@code null},
     * the new column is appended as the last column. Otherwise, it is inserted
     * at the specified index.</p>
     *
     * @param tableId         The UUID of the table in which the column is to be created.
     * @param columnCreateDTO DTO containing the data type and optional column index.
     * @return                A {@link ColumnCreatedDTO} containing metadata of the newly created column.
     */
    public ColumnCreatedDTO addNewColumn(UUID tableId, ColumnCreateDTO columnCreateDTO) {
        ColumnProxy createdColumn;

        if (columnCreateDTO.columnIndex() == null)
            createdColumn = appendNewColumn(tableId, columnCreateDTO.dataTypeId());
        else
            createdColumn = insertColumnAt(tableId, columnCreateDTO.dataTypeId(), columnCreateDTO.columnIndex());

        return new ColumnCreatedDTO(
                createdColumn.getId(),
                createdColumn.getMyTable(),
                createdColumn.getDataTypeId(),
                createdColumn.getColumnIndex()
        );
    }


    /**
     * Applies partial updates to a column based on the provided patch DTO.
     * Currently, only the data type can be updated; other fields in {@code patchDTO}
     * are ignored if null.
     *
     * @param tableId    UUID of the table containing the column to patch.
     * @param columnId   UUID of the column to update.
     * @param patchDTO   DTO carrying the new dataTypeId; if null, no change is applied.
     */
    public void patchColumn(UUID tableId, UUID columnId, ColumnPatchDTO patchDTO) {
        if (patchDTO.dataTypeId() != null)
            columnDAO.changeColumnDataType(tableId, columnId, patchDTO.dataTypeId());
    }


    /**
     * Updates the value of a single cell, identified by its row and column indices.
     *
     * <p>This method looks up the internal row and column IDs, then delegates
     * the update to the DAO.</p>
     *
     * @param tableId        UUID of the table containing the cell.
     * @param rowIndex       Zero-based index of the row in which the cell resides.
     * @param columnIndex    Zero-based index of the column in which the cell resides.
     * @param cellPatchDTO   DTO carrying the new cell value.
     *
     * @return               {@link CellPatchedDTO} containing the updated cell's row
     *                       index, column index, and new value.
     */
    @Transactional
    public CellPatchedDTO updateCellValue(UUID tableId, int rowIndex, int columnIndex, CellPatchDTO cellPatchDTO) {
        System.out.println(rowIndex + " " + columnIndex + " " + tableId);
        cellDAO.updateCell(
                rowDAO.findRowIdByIndex(tableId, rowIndex),
                columnDAO.findColumnIdByIndex(tableId, columnIndex),
                cellPatchDTO.value()
        );

        return new CellPatchedDTO(rowIndex, columnIndex, cellPatchDTO.value());
    }


    /**
     * Delete a list of columns from the specified table within a transaction.
     *
     * @param tableId           UUID of the table from which columns will be deleted.
     * @param columnsDeleteDTO  DTO carrying the list of column UUIDs to delete.
     * @return                  {@link ColumnsDeletedDTO} containing the list of integer indexes
     *                          representing positions of columns removed.
     */
    @Transactional
    public ColumnsDeletedDTO deleteColumns(UUID tableId, ColumnsDeleteDTO columnsDeleteDTO) {
        List<Integer> deletedColumnsIndexes = new ArrayList<>();

        for (UUID columnId : columnsDeleteDTO.ids()) {
            deletedColumnsIndexes.add(columnDAO.deleteColumn(columnId, tableId));
        }

        return new ColumnsDeletedDTO(deletedColumnsIndexes);
    }


//    @Transactional
//    public void updateColumnsIndexes(List<UpdateColumnIndexDTO> columnDTOList) {
//        List<Pair<UUID, Integer>> toUpdate = columnDTOList.stream().map(
//                dto -> new Pair<>(columnDAO.findColumnIdByIndex(dto.tableId(), dto.currentColumnIndex()), dto.newColumnIndex())
//        ).toList();
//
//
//        for (int i = 0; i < columnDTOList.size(); ++i) {
//            columnDAO.updateColumnIndex(toUpdate.get(i).getFirst(), toUpdate.get(i).getSecond(), columnDTOList.get(i).tableId());
//        }
//    }


    /**
     * Delete a list of rows from the specified table within a transaction.
     *
     * @param tableId        UUID of the table from which rows will be deleted.
     * @param rowsDeleteDTO  DTO carrying the list of row UUIDs to delete.
     * @return               {@link RowsDeletedDTO} containing the list of integer indexes
     *                       representing positions of rows removed.
     */
    @Transactional
    public RowsDeletedDTO deleteRows(UUID tableId, RowsDeleteDTO rowsDeleteDTO) {
        List<Integer> deletedRowsIndexes = new ArrayList<>();

        for (UUID rowId : rowsDeleteDTO.ids()) {
            deletedRowsIndexes.add(rowDAO.deleteRow(tableId, rowId));
        }

        return new RowsDeletedDTO(deletedRowsIndexes);
    }


//    @Transactional
//    public void updateRowsIndexes(List<UpdateRowIndexDTO> rowDTOList) {
//        List<Pair<UUID, Integer>> toUpdate = rowDTOList.stream().map(
//                dto -> new Pair<>(rowDAO.findRowIdByIndex(dto.tableId(), dto.currentRowIndex()), dto.newRowIndex())
//        ).toList();
//
//        for (int i = 0; i < rowDTOList.size(); ++i) {
//            rowDAO.updateRowIndex(toUpdate.get(i).getFirst(), toUpdate.get(i).getSecond(), rowDTOList.get(i).tableId());
//        }
//    }
}
