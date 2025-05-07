package com.github.bytestrick.tabula.service;

import com.github.bytestrick.tabula.controller.dto.table.ColumnDTO;
import com.github.bytestrick.tabula.controller.dto.table.RowDTO;
import com.github.bytestrick.tabula.controller.dto.table.TableDTO;
import com.github.bytestrick.tabula.controller.dto.TableDto;
import com.github.bytestrick.tabula.model.Table;
import com.github.bytestrick.tabula.model.User;
import com.github.bytestrick.tabula.controller.dto.table.*;
import com.github.bytestrick.tabula.model.Pair;
import com.github.bytestrick.tabula.model.table.Cell;
import com.github.bytestrick.tabula.repository.TableDao;
import com.github.bytestrick.tabula.repository.UserDao;
import com.github.bytestrick.tabula.repository.interfaces.IndexesSortedDAO;
import com.github.bytestrick.tabula.repository.proxy.table.ColumnProxy;
import com.github.bytestrick.tabula.repository.proxy.table.RowProxy;
import com.github.bytestrick.tabula.repository.proxy.table.TableProxy;
import com.github.bytestrick.tabula.repository.table.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

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
     * Creates a new, empty table with one row and one column.
     * <ul>
     *   <li>Generates a new table UUID.</li>
     *   <li>Persists the table record.</li>
     *   <li>Appends one row and one column of type "Textual".</li>
     * </ul>
     *
     * @return
     *   UUID of the newly created table.
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


    /**
     * Deletes an entire table and all its associated rows and cells.
     *
     * @param tableId
     *   UUID of the table to delete.
     */
    public String deleteTable(UUID tableId) {
        tableDAO.deleteTable(tableId);
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
     * Applies partial updates to a column’s properties.
     * <p>
     *   Only non-null fields in {@code patchDTO} ({@link ColumnPatchDTO}) are applied:
     *   <ul>
     *     <li>Data type change: updates column type and resets all cell values in that column.</li>
     *     <li>Name change: updates column header.</li>
     *   </ul>
     * </p>
     *
     * @param tableId
     *   UUID of the parent table.
     * @param columnId
     *   UUID of the column to patch.
     * @param patchDTO
     *   DTO carrying optional new dataTypeId and/or columnName.
     * @return
     *   A {@link ColumnPatchedDTO} containing the updated column index, name, and type ID.
     */
    @Transactional
    public ColumnPatchedDTO patchHeaderColumn(UUID tableId, UUID columnId, ColumnPatchDTO patchDTO) {
        if (patchDTO.dataTypeId() != null) {
            columnDAO.changeColumnDataType(tableId, columnId, patchDTO.dataTypeId());
            cellDAO.resetColumnCellsValues(columnId);
        }

        if (patchDTO.columnName() != null)
            columnDAO.changeColumnName(tableId, columnId, patchDTO.columnName());

        return new ColumnPatchedDTO(
                columnId,
                columnDAO.findColumnIndexById(tableId, columnId),
                patchDTO.columnName(),
                patchDTO.dataTypeId()
        );
    }


    /**
     * Updates one or more cell values in bulk.
     * <p>
     *   For each {@link CellPatchDTO}:
     *   <ul>
     *     <li>If both rowId and columnId are present, updates that single cell.</li>
     *     <li>If only rowId is present, updates all cells in that row.</li>
     *     <li>If only columnId is present, updates all cells in that column.</li>
     *   </ul>
     *   Skips any update whose dataTypeId does not match the column’s type.
     * </p>
     *
     * @param tableId
     *   UUID of the table containing the cells.
     * @param cellsPatchDTO
     *   List of {@link CellPatchDTO} carrying target IDs, dataTypeId, and newValue.
     * @return
     *   List of {@link CellPatchedDTO} describing each successfully updated cell’s
     *   zero-based row & column indexes and new value.
     */
    @Transactional
    public List<CellPatchedDTO> updateCellValue(UUID tableId, List<CellPatchDTO> cellsPatchDTO) {
        List<CellPatchedDTO> cellsPatched = new ArrayList<>();

        for (CellPatchDTO cellPatchDTO : cellsPatchDTO) {
            // single cell update
            if (cellPatchDTO.rowId() != null && cellPatchDTO.columnId() != null) {
                if (!columnDAO.matchColumnDataType(tableId, cellPatchDTO.columnId(), cellPatchDTO.dataTypeId()))
                    continue;

                cellDAO.updateCell(cellPatchDTO.rowId(), cellPatchDTO.columnId(), cellPatchDTO.newValue());
                cellsPatched.add(
                        new CellPatchedDTO(
                            rowDAO.findRowIndexFromId(tableId, cellPatchDTO.rowId()),
                            columnDAO.findColumnIndexFromId(tableId, cellPatchDTO.columnId()),
                            cellPatchDTO.newValue()
                        )
                );
            }
            // row-wide update
            else if (cellPatchDTO.rowId() != null) {
                List<UUID> rowCellsColumnsIds = cellDAO.findRowCellsColumnsIds(cellPatchDTO.rowId());

                for (UUID rowCellsColumnId : rowCellsColumnsIds) {
                    if (!columnDAO.matchColumnDataType(tableId, rowCellsColumnId, cellPatchDTO.dataTypeId()))
                        continue;

                    cellDAO.updateCell(cellPatchDTO.rowId(), rowCellsColumnId, cellPatchDTO.newValue());
                    cellsPatched.add(
                            new CellPatchedDTO(
                                    rowDAO.findRowIndexFromId(tableId, cellPatchDTO.rowId()),
                                    columnDAO.findColumnIndexFromId(tableId, rowCellsColumnId),
                                    cellPatchDTO.newValue()
                            )
                    );
                }
            }
            // column-wide update
            else if (cellPatchDTO.columnId() != null) {
                if (!columnDAO.matchColumnDataType(tableId, cellPatchDTO.columnId(), cellPatchDTO.dataTypeId()))
                    continue;

                List<UUID> columnCellsRowsIds = cellDAO.findColumnCellsRowsIds(cellPatchDTO.columnId());

                for (UUID columnCellsRowId : columnCellsRowsIds) {
                    cellDAO.updateCell(columnCellsRowId, cellPatchDTO.columnId(), cellPatchDTO.newValue());
                    cellsPatched.add(
                            new CellPatchedDTO(
                                    rowDAO.findRowIndexFromId(tableId, columnCellsRowId),
                                    columnDAO.findColumnIndexFromId(tableId, cellPatchDTO.columnId()),
                                    cellPatchDTO.newValue()
                            )
                    );
                }
            }
        }

        return cellsPatched;
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


    /**
     * Computes the individual index shifts required to move a single item
     * from one position to another.
     * <p>
     *   For each index between {@code fromIndex} and {@code toIndex}, generates a
     *   Pair(originalIndex, shiftedIndex). Finally, includes the pair
     *   (fromIndex, toIndex) itself.
     * </p>
     *
     * @param fromIndex
     *   The original zero-based position of the item.
     * @param toIndex
     *   The desired zero-based position of the item.
     * @return
     *   A list of {@code Pair<Integer, Integer>}; where each pair maps an original
     *   index that must be shifted to its new index.
     */
    private List<Pair<Integer, Integer>> getMovedIndexes(int fromIndex, int toIndex) {
        List<Pair<Integer, Integer>> indexesMoved = new ArrayList<>();

        if (fromIndex > toIndex) {
            for (int i = toIndex; i <= fromIndex - 1; ++i) {
                indexesMoved.add(new Pair<>(i, i + 1));
            }
        } else if (fromIndex < toIndex) {
            for (int i = fromIndex + 1; i <= toIndex; ++i) {
                indexesMoved.add(new Pair<>(i, i - 1));
            }
        } else {
            return indexesMoved;
        }

        indexesMoved.add(new Pair<>(fromIndex, toIndex));
        return indexesMoved;
    }


    /**
     * Sorts the list of indexes to move in the order in which they must be updated
     * to avoid conflicts during batch shifts.
     * <p>
     *   If the shift delta is negative, sorts ascending; if positive, sorts descending;
     *   if zero or the list is empty, returns an empty list.
     * </p>
     *
     * @param rawDelta
     *   The difference {@code toIndex - fromIndex} determining shift direction.
     * @param tableId
     *  Id of the table to which the indexes belong.
     * @param ids
     *   The list of zero-based indexes selected for movement.
     * @param dao
     *  DAO implementing {@link IndexesSortedDAO} used to perform the sorting operation.
     * @return
     *   The sorted indexes according to the shift direction.
     */
    private List<Integer> getSortedIndexesToMove(int rawDelta,
                                                 UUID tableId,
                                                 List<UUID> ids,
                                                 IndexesSortedDAO dao) {

        if (rawDelta < 0) {
            return dao.findIndexesFromIdsSortedAscending(tableId, ids);
        }
        else if (rawDelta > 0) {
            return dao.findIndexesFromIdsSortedDescending(tableId, ids);
        }

        return new ArrayList<>();
    }


    /**
     * Adjusts the raw shift delta to ensure that no moved index overflows the valid
     * bounds: {@code [minBounds, maxBounds)}.
     *
     * @param rawDelta
     *   The initial shift distance (can be positive or negative).
     * @param sortedIndexesToMove
     *   A sorted list of the indexes to move (ascending if negative shift, descending if positive).
     * @param minBounds
     *   The minimum valid index (inclusive).
     * @param maxBounds
     *   The maximum valid index (exclusive).
     * @return
     *   The adjusted shift delta that keeps all moves within bounds.
     */
    private int getAdjustedDeltaToBounds(int rawDelta,
                                         List<Integer> sortedIndexesToMove,
                                         int minBounds,
                                         int maxBounds) {

        if (sortedIndexesToMove.isEmpty()) {
            return 0;
        }

        int minIndex = 0;
        int maxIndex = 0;

        if (rawDelta < 0) {
            // sortedIndexesToMove: ascending order
            minIndex = sortedIndexesToMove.getFirst();
            maxIndex = sortedIndexesToMove.getLast();
        }
        else if (rawDelta > 0) {
            // sortedIndexesToMove: descending order
            minIndex = sortedIndexesToMove.getLast();
            maxIndex = sortedIndexesToMove.getFirst();
        }

        return Math.clamp(rawDelta, minBounds - minIndex, maxBounds - 1 - maxIndex);
    }


    /**
     * Merges a new batch of moved index pairs into the overall update plan,
     * avoiding duplicate or conflicting entries.
     * <p>
     *   Compares each pair in {@code currentMovedIndexes} against a snapshot of
     *   the existing {@code indexesToUpdate}. If a mapping for that original index
     *   already exists, its target is updated; otherwise, the new pair is appended.
     * </p>
     *
     * @param indexesToUpdate
     *   The master list of original-to-new index mappings being built.
     * @param currentMovedIndexes
     *   The new batch of mappings to integrate.
     */
    private void reconstructIndexesToUpdate(List<Pair<Integer, Integer>> indexesToUpdate,
                                            List<Pair<Integer, Integer>> currentMovedIndexes) {

        List<Pair<Integer, Integer>> newIndexesDiscovered = new ArrayList<>();
        List<Pair<Integer, Integer>> indexesSnapshot = new ArrayList<>();

        // Snapshot of the original list
        for (Pair<Integer, Integer> p : indexesToUpdate) {
            indexesSnapshot.add(new Pair<>(p.getFirst(), p.getSecond()));
        }

        // For each shifted pair, a match is sought in the snapshot
        for (Pair<Integer, Integer> p : currentMovedIndexes) {
            int matchedSnapshotIndex = -1;

            for (int k = 0; k < indexesSnapshot.size(); ++k) {
                if (indexesSnapshot.get(k).getSecond().equals(p.getFirst())) {
                    matchedSnapshotIndex = k;
                    break;
                }
            }

            if (matchedSnapshotIndex >= 0) {
                indexesToUpdate.get(matchedSnapshotIndex).setSecond(p.getSecond());
            } else {
                newIndexesDiscovered.add(p);
            }
        }

        indexesToUpdate.addAll(newIndexesDiscovered);
    }


    private List<Pair<Integer, Integer>> getIndexToUpdate(List<Integer> indexToMove, int adjustedDelta) {
        List<Pair<Integer, Integer>> indexesToUpdate = new ArrayList<>();

        for (int i : indexToMove) {
            List<Pair<Integer, Integer>> currentMovedIndexes = getMovedIndexes(i, i + adjustedDelta);
            reconstructIndexesToUpdate(indexesToUpdate, currentMovedIndexes);
        }

        return indexesToUpdate;
    }


    /**
     * Validates whether a move operation from {@code fromIndex} to {@code toIndex}
     * is within the allowed range and not a no-op.
     *
     * @param fromIndex
     *   The starting zero-based index.
     * @param toIndex
     *   The target zero-based index.
     * @param totalAmount
     *   The total number of elements (rows or columns) in the table.
     * @return
     *   {@code true} if both indices are within [0, totalAmount) and differ; {@code false} otherwise.
     */
    private boolean canMoveRowOrColumn(int fromIndex, int toIndex, int totalAmount) {
        if (fromIndex < 0 || fromIndex >= totalAmount)
            return false;

        if (toIndex < 0 || toIndex >= totalAmount)
            return false;

        if (fromIndex == toIndex)
            return false;

        return true;
    }


    /**
     * Moves rows within a table.
     *
     * <ul>
     *   <li>
     *      Computes raw shift: {@code rawDelta = toIndex - fromIndex} (does not take
     *      into account the size of the table).
     *   </li>
     *   <li>Determines affected row indexes.</li>
     *   <li>Adjusts the delta to avoid boundary overflows.</li>
     *   <li>Updates each row’s index in the database.</li>
     *   <li>Returns the moved indexes and the applied delta.</li>
     * </ul>
     *
     * @param tableId
     *   UUID of the table to modify.
     * @param moveRowsDTO
     *   DTO carrying list of row UUIDs to move and source/target indexes.
     * @return
     *   A {@link MovedRowsOrColumnsDTO} listing the original zero-based indexes
     *   and the actual shift delta applied.
     * @throws RuntimeException
     *   if movement parameters are invalid or indexes out of bounds.
     */
    @Transactional
    public MovedRowsOrColumnsDTO moveRowsIndexes(UUID tableId, MovesRowsOrColumnsDTO moveRowsDTO) {
        int rowsAmount = rowDAO.getRowsNumber(tableId);

        if (!canMoveRowOrColumn(moveRowsDTO.fromIndex(), moveRowsDTO.toIndex(), rowsAmount))
            throw new RuntimeException();

        int rawDelta = moveRowsDTO.toIndex() - moveRowsDTO.fromIndex();
        List<Integer> sortedRowsIndexesToMove = getSortedIndexesToMove(rawDelta, tableId, moveRowsDTO.idsToMove(), rowDAO);
        int adjustedDelta = getAdjustedDeltaToBounds(rawDelta, sortedRowsIndexesToMove, 0, rowsAmount);

        List<Pair<UUID, Integer>> convertedList = getIndexToUpdate(sortedRowsIndexesToMove, adjustedDelta)
                .stream()
                .map(
                        (Pair<Integer, Integer> p) ->
                                new Pair<>(rowDAO.findRowIdByIndex(tableId, p.getFirst()), p.getSecond())
                )
                .toList();

        for (Pair<UUID, Integer> p : convertedList) {
            rowDAO.updateRowIndex(p.getFirst(), p.getSecond(), tableId);
        }

        return new MovedRowsOrColumnsDTO(sortedRowsIndexesToMove, adjustedDelta);
    }


    /**
     * Moves columns within a table.
     *
     * <ul>
     *   <li>
     *      Computes raw shift: {@code rawDelta = toIndex - fromIndex} (does not take
     *      into account the size of the table).
     *   </li>
     *   <li>Determines affected column indexes.</li>
     *   <li>Adjusts the delta to avoid boundary overflows.</li>
     *   <li>Updates each column’s index in the database.</li>
     *   <li>Returns the moved indexes and the applied delta.</li>
     * </ul>
     *
     * @param tableId
     *   UUID of the table to modify.
     * @param moveColumnsDTO
     *   DTO carrying list of columns UUIDs to move and source/target indexes.
     * @return
     *   A {@link MovedRowsOrColumnsDTO} listing the original zero-based indexes
     *   and the actual shift delta applied.
     * @throws RuntimeException
     *   if movement parameters are invalid or indexes out of bounds.
     */
    @Transactional
    public MovedRowsOrColumnsDTO moveColumnsIndexes(UUID tableId, MovesRowsOrColumnsDTO moveColumnsDTO) {
        int columnsAmount = columnDAO.getColumnNumber(tableId);

        if (!canMoveRowOrColumn(moveColumnsDTO.fromIndex(), moveColumnsDTO.toIndex(), columnsAmount))
            throw new RuntimeException();

        int rawDelta = moveColumnsDTO.toIndex() - moveColumnsDTO.fromIndex();
        List<Integer> sortedColumnsIndexesToMove = getSortedIndexesToMove(rawDelta, tableId, moveColumnsDTO.idsToMove(), columnDAO);
        int adjustedDelta = getAdjustedDeltaToBounds(rawDelta, sortedColumnsIndexesToMove, 0, columnsAmount);

        List<Pair<UUID, Integer>> convertedList = getIndexToUpdate(sortedColumnsIndexesToMove, adjustedDelta)
                .stream()
                .map(
                        (Pair<Integer, Integer> p) ->
                                new Pair<>(columnDAO.findColumnIdByIndex(tableId, p.getFirst()), p.getSecond())
                )
                .toList();

        for (Pair<UUID, Integer> p : convertedList) {
            columnDAO.updateColumnIndex(p.getFirst(), p.getSecond(), tableId);
        }

        return new MovedRowsOrColumnsDTO(sortedColumnsIndexesToMove, adjustedDelta);
    }
}
