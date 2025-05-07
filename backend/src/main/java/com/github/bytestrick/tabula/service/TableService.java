package com.github.bytestrick.tabula.service;

import com.github.bytestrick.tabula.controller.dto.table.ColumnDTO;
import com.github.bytestrick.tabula.controller.dto.table.RowDTO;
import com.github.bytestrick.tabula.controller.dto.table.TableDTO;
import com.github.bytestrick.tabula.controller.dto.TableDto;
import com.github.bytestrick.tabula.model.Table;
import com.github.bytestrick.tabula.model.User;
import com.github.bytestrick.tabula.controller.dto.table.*;
import com.github.bytestrick.tabula.exception.table.*;
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
     * Ensures that the DataType identified by {@code dataTypeId} exists in the
     * system; otherwise throws a DataTypeNotFound exception.
     *
     * @param dataTypeId
     *        Numeric identifier of the DataType to verify.
     * @throws DataTypeNotFound
     *         If no DataType with the specified ID is found.
     */
    private void ensureDataTypeExistsOrThrow(int dataTypeId) {
        if (!dataTypeDAO.dataTypeExists(dataTypeId)) {
            throw new DataTypeNotFound(dataTypeId);
        }
    }


    /**
     * Verifies that a table with the given UUID exists; otherwise throws.
     *
     * @param tableId The UUID of the table to check.
     * @throws TableNotFoundException If no table exists for the given {@code tableId}.
     */
    private void ensureTableExistsOrThrow(UUID tableId) {
        if (!tableDAO.tableExists(tableId)) {
            throw new TableNotFoundException(tableId);
        }
    }


    /**
     * Verifies that a row with the given UUID exists within the specified table; otherwise throws.
     *
     * @param tableId The UUID of the table to check within.
     * @param rowId   The UUID of the row to check for.
     * @throws RowNotFound If no row exists with the given {@code rowId} in the specified {@code tableId}.
     */
    private void ensureRowExistsOrThrow(UUID tableId, UUID rowId) {
        if (!rowDAO.rowExists(tableId, rowId)) {
            throw new RowNotFound(rowId, tableId);
        }
    }


    /**
     * Verifies that a column with the given UUID exists within the specified table; otherwise throws.
     *
     * @param tableId  The UUID of the table to check within.
     * @param columnId The UUID of the column to check for.
     * @throws ColumnNotFound If no column exists with the given {@code columnId} in the specified {@code tableId}.
     */
    private void ensureColumnExistsOrThrow(UUID tableId, UUID columnId) {
        if (!columnDAO.columnExists(tableId, columnId)) {
            throw new ColumnNotFound(columnId, tableId);
        }
    }


    /**
     * Verifies that a specified index is within a valid range [{@code minBounds}, {@code maxBounds}).
     *
     * @param index     The index to verify.
     * @param minBounds The lower bound (inclusive) of the valid range.
     * @param maxBounds The upper bound (exclusive) of the valid range.
     * @throws IndexOutOfBoundsException If the {@code index} is less than {@code minBounds}
     * or greater than or equal to {@code maxBounds}.
     */
    private void ensureIndexIsWithinTheBoundsOrThrow(int index, int minBounds, int maxBounds) {
        if (index < minBounds || index >= maxBounds)
            throw new IndexOutOfBoundsException(
                    "index: " + index + ", minBounds: " + minBounds + ", maxBounds: " + maxBounds
            );
    }


    /**
     * Creates a new, empty table with one row and one column.
     * <ul>
     *   <li>Generates a new table UUID.</li>
     *   <li>Persists the table record.</li>
     *   <li>Appends one row and one column of type "Textual".</li>
     * </ul>
     *
     * @return UUID of the newly created table.
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
     * @throws TableNotFoundException if no table exists for the given {@code tableId}.
     */
    @Transactional
    public TableDTO getTable(UUID tableId) {
        ensureTableExistsOrThrow(tableId);

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
     * @param tableId UUID of the table to delete.
     * @throws TableNotFoundException if no table exists for the given {@code tableId}.
     */
    @Transactional
    public String deleteTable(UUID tableId) {
        ensureTableExistsOrThrow(tableId);
        tableDAO.deleteTable(tableId);
        return "Table deleted successfully";
    }


    private RowProxy appendNewRow(UUID tableId) {
        return rowDAO.appendNewRow(tableId, UUID.randomUUID());
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
     * @param tableId      The UUID of the table in which the new row should be added.
     * @param rowCreateDTO DTO containing the optional row index.
     * @return A {@link RowCreatedDTO} containing metadata of the newly created row.
     * @throws TableNotFoundException if no table exists for the given {@code tableId}.
     */
    @Transactional
    public RowCreatedDTO addNewRow(UUID tableId, RowCreateDTO rowCreateDTO) {
        ensureTableExistsOrThrow(tableId);

        RowProxy createRow;

        if (rowCreateDTO.rowIndex() == null)
            createRow = appendNewRow(tableId);
        else {
            ensureIndexIsWithinTheBoundsOrThrow(
                    rowCreateDTO.rowIndex(), 0, rowDAO.getRowsNumber(tableId)
            );
            createRow = insertNewRowAt(tableId, rowCreateDTO.rowIndex());
        }

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
     * @return A {@link ColumnCreatedDTO} containing metadata of the newly created column.
     * @throws TableNotFoundException if no table exists for the given {@code tableId}.
     */
    @Transactional
    public ColumnCreatedDTO addNewColumn(UUID tableId, ColumnCreateDTO columnCreateDTO) {
        ensureTableExistsOrThrow(tableId);
        ensureDataTypeExistsOrThrow(columnCreateDTO.dataTypeId());

        ColumnProxy createdColumn;

        if (columnCreateDTO.columnIndex() == null)
            createdColumn = appendNewColumn(tableId, columnCreateDTO.dataTypeId());
        else {
            ensureIndexIsWithinTheBoundsOrThrow(
                    columnCreateDTO.columnIndex(), 0, columnDAO.getColumnNumber(tableId)
            );
            createdColumn = insertColumnAt(tableId, columnCreateDTO.dataTypeId(), columnCreateDTO.columnIndex());
        }

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
     * Only non-null fields in {@code patchDTO} ({@link ColumnPatchDTO}) are applied:
     *   <ul>
     *     <li>Data type change: updates column type and resets all cell values in that column.</li>
     *     <li>Name change: updates column header.</li>
     *   </ul>
     * </p>
     *
     * @param tableId  UUID of the parent table.
     * @param columnId UUID of the column to patch.
     * @param patchDTO DTO carrying optional new dataTypeId and/or columnName.
     * @return A {@link ColumnPatchedDTO} containing the updated column index, name, and type ID.
     * @throws TableNotFoundException if no table exists for the given {@code tableId}.
     */
    @Transactional
    public ColumnPatchedDTO patchHeaderColumn(UUID tableId, UUID columnId, ColumnPatchDTO patchDTO) {
        ensureTableExistsOrThrow(tableId);
        ensureColumnExistsOrThrow(tableId, columnId);

        if (patchDTO.dataTypeId() != null) {
            ensureDataTypeExistsOrThrow(patchDTO.dataTypeId());
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
     * For each {@link CellPatchDTO}:
     *   <ul>
     *     <li>If both rowId and columnId are present, updates that single cell.</li>
     *     <li>If only rowId is present, updates all cells in that row.</li>
     *     <li>If only columnId is present, updates all cells in that column.</li>
     *   </ul>
     *   Skips any update whose dataTypeId does not match the column’s type.
     * </p>
     *
     * @param tableId       UUID of the table containing the cells.
     * @param cellsPatchDTO List of {@link CellPatchDTO} carrying target IDs, dataTypeId, and newValue.
     * @return List of {@link CellPatchedDTO} describing each successfully updated cell’s
     * zero-based row & column indexes and new value.
     * @throws TableNotFoundException if no table exists for the given {@code tableId}.
     */
    @Transactional
    public List<CellPatchedDTO> updateCellValue(UUID tableId, List<CellPatchDTO> cellsPatchDTO) {
        ensureTableExistsOrThrow(tableId);

        List<CellPatchedDTO> cellsPatched = new ArrayList<>();

        for (CellPatchDTO cellPatchDTO : cellsPatchDTO) {
            ensureDataTypeExistsOrThrow(cellPatchDTO.dataTypeId());

            // single cell update
            if (cellPatchDTO.rowId() != null && cellPatchDTO.columnId() != null) {
                ensureColumnExistsOrThrow(tableId, cellPatchDTO.columnId());
                ensureRowExistsOrThrow(tableId, cellPatchDTO.rowId());

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
                ensureRowExistsOrThrow(tableId, cellPatchDTO.rowId());

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
                ensureColumnExistsOrThrow(tableId, cellPatchDTO.columnId());

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
     * @param tableId          UUID of the table from which columns will be deleted.
     * @param columnsDeleteDTO DTO carrying the list of column UUIDs to delete.
     * @return {@link ColumnsDeletedDTO} containing the list of integer indexes
     * representing positions of columns removed.
     * @throws AtLeastOneRowAndOneColumn if deleting the requested columns would leave the table with zero columns
     *                                   (i.e. the remaining columns count would be ≤ 0).
     * @throws TableNotFoundException    if no table exists for the given {@code tableId}.
     */
    @Transactional
    public ColumnsDeletedDTO deleteColumns(UUID tableId, ColumnsDeleteDTO columnsDeleteDTO) {
        ensureTableExistsOrThrow(tableId);

        if ((columnDAO.getColumnNumber(tableId) - columnsDeleteDTO.ids().size()) <= 0)
            throw new AtLeastOneRowAndOneColumn();

        List<Integer> deletedColumnsIndexes = new ArrayList<>();

        for (UUID columnId : columnsDeleteDTO.ids()) {
            ensureColumnExistsOrThrow(tableId, columnId);
            deletedColumnsIndexes.add(columnDAO.deleteColumn(columnId, tableId));
        }

        return new ColumnsDeletedDTO(deletedColumnsIndexes);
    }


    /**
     * Delete a list of rows from the specified table within a transaction.
     *
     * @param tableId       UUID of the table from which rows will be deleted.
     * @param rowsDeleteDTO DTO carrying the list of row UUIDs to delete.
     * @return {@link RowsDeletedDTO} containing the list of integer indexes
     * representing positions of rows removed.
     * @throws AtLeastOneRowAndOneColumn if deleting the requested rows would leave the table with zero rows
     *                                   (i.e. the remaining rows count would be ≤ 0).
     * @throws TableNotFoundException    if no table exists for the given {@code tableId}.
     */
    @Transactional
    public RowsDeletedDTO deleteRows(UUID tableId, RowsDeleteDTO rowsDeleteDTO) {
        ensureTableExistsOrThrow(tableId);

        if ((rowDAO.getRowsNumber(tableId) - rowsDeleteDTO.ids().size()) <= 0)
            throw new AtLeastOneRowAndOneColumn();

        List<Integer> deletedRowsIndexes = new ArrayList<>();

        for (UUID rowId : rowsDeleteDTO.ids()) {
            ensureRowExistsOrThrow(tableId, rowId);
            deletedRowsIndexes.add(rowDAO.deleteRow(tableId, rowId));
        }

        return new RowsDeletedDTO(deletedRowsIndexes);
    }


    /**
     * Computes the individual index shifts required to move a single item
     * from one position to another.
     * <p>
     * For each index between {@code fromIndex} and {@code toIndex}, generates a
     * Pair(originalIndex, shiftedIndex). Finally, includes the pair
     * (fromIndex, toIndex) itself.
     * </p>
     *
     * @param fromIndex The original zero-based position of the item.
     * @param toIndex   The desired zero-based position of the item.
     * @return A list of {@code Pair<Integer, Integer>}; where each pair maps an original
     * index that must be shifted to its new index.
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
     * If the shift delta is negative, sorts ascending; if positive, sorts descending;
     * if zero or the list is empty, returns an empty list.
     * </p>
     *
     * @param rawDelta The difference {@code toIndex - fromIndex} determining shift direction.
     * @param tableId  Id of the table to which the indexes belong.
     * @param ids      The list of zero-based indexes selected for movement.
     * @param dao      DAO implementing {@link IndexesSortedDAO} used to perform the sorting operation.
     * @return The sorted indexes according to the shift direction.
     */
    private List<Integer> getSortedIndexesToMove(int rawDelta,
                                                 UUID tableId,
                                                 List<UUID> ids,
                                                 IndexesSortedDAO dao) {

        if (rawDelta < 0) {
            return dao.findIndexesFromIdsSortedAscending(tableId, ids);
        } else if (rawDelta > 0) {
            return dao.findIndexesFromIdsSortedDescending(tableId, ids);
        }

        return new ArrayList<>();
    }


    /**
     * Adjusts the raw shift delta to ensure that no moved index overflows the valid
     * bounds: {@code [minBounds, maxBounds)}.
     *
     * @param rawDelta            The initial shift distance (can be positive or negative).
     * @param sortedIndexesToMove A sorted list of the indexes to move (ascending if negative shift, descending if positive).
     * @param minBounds           The minimum valid index (inclusive).
     * @param maxBounds           The maximum valid index (exclusive).
     * @return The adjusted shift delta that keeps all moves within bounds.
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
        } else if (rawDelta > 0) {
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
     * Compares each pair in {@code currentMovedIndexes} against a snapshot of
     * the existing {@code indexesToUpdate}. If a mapping for that original index
     * already exists, its target is updated; otherwise, the new pair is appended.
     * </p>
     *
     * @param indexesToUpdate     The master list of original-to-new index mappings being built.
     * @param currentMovedIndexes The new batch of mappings to integrate.
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
     * @param fromIndex   The starting zero-based index.
     * @param toIndex     The target zero-based index.
     * @param totalAmount The total number of elements (rows or columns) in the table.
     * @return {@code true} if both indices are within [0, totalAmount) and differ;
     * {@code throw IndexOutOfBoundsException} otherwise.
     * @throws IndexOutOfBoundsException if {@code fromIndex} or {@code toIndex} is
     *                                   less than 0 or greater than or equal to {@code totalAmount}.
     */
    private boolean canMoveRowOrColumn(int fromIndex, int toIndex, int totalAmount) {
        ensureIndexIsWithinTheBoundsOrThrow(fromIndex, 0, totalAmount);
        ensureIndexIsWithinTheBoundsOrThrow(toIndex, 0, totalAmount);

        return fromIndex != toIndex;
    }


    /**
     * Moves rows within a table.
     *
     * <ul>
     *   <li>Computes raw shift: {@code rawDelta = toIndex - fromIndex}.</li>
     *   <li>Verifies that the table exists.</li>
     *   <li>Verifies that each {@code rowId} in {@code idsToMove} exists in the table.</li>
     *   <li>Determines affected row indexes and sorts them to avoid conflicts.</li>
     *   <li>Adjusts the delta to prevent out-of-bounds moves.</li>
     *   <li>Updates each row’s index in the database.</li>
     *   <li>Returns the list of zero-based indexes that were moved
     *       and the actual shift delta applied.</li>
     * </ul>
     *
     * @param tableId     UUID of the table to modify.
     * @param moveRowsDTO DTO ({@link MovesRowsOrColumnsDTO}).
     *
     * @return {@link MovedRowsOrColumnsDTO}.
     *
     * @throws TableNotFoundException  if no table exists for the given {@code tableId}.
     * @throws RowNotFound            if any UUID in {@code idsToMove} does not correspond
     *                                 to an existing row in that table.
     * @throws IndexOutOfBoundsException if {@code fromIndex} or {@code toIndex} is
     *                                   outside the valid range [{@code 0}, {@code rowCount}).
     */
    @Transactional
    public MovedRowsOrColumnsDTO moveRowsIndexes(UUID tableId, MovesRowsOrColumnsDTO moveRowsDTO) {
        ensureTableExistsOrThrow(tableId);

        int rowsAmount = rowDAO.getRowsNumber(tableId);

        if (!canMoveRowOrColumn(moveRowsDTO.fromIndex(), moveRowsDTO.toIndex(), rowsAmount))
            return new MovedRowsOrColumnsDTO(new ArrayList<>(), 0);

        moveRowsDTO.idsToMove().forEach((UUID id) -> this.ensureRowExistsOrThrow(tableId, id));

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
     *   <li>Computes raw shift: {@code rawDelta = toIndex - fromIndex}.</li>
     *   <li>Verifies that the table exists.</li>
     *   <li>Verifies that each {@code columnId} in {@code idsToMove} exists in the table.</li>
     *   <li>Determines affected column indexes and sorts them to avoid conflicts.</li>
     *   <li>Adjusts the delta to prevent out-of-bounds moves.</li>
     *   <li>Updates each column’s index in the database.</li>
     *   <li>Returns the list of zero-based indexes that were moved
     *       and the actual shift delta applied.</li>
     * </ul>
     *
     * @param tableId        UUID of the table to modify.
     * @param moveColumnsDTO DTO ({@link MovesRowsOrColumnsDTO}).
     *
     * @return {@link MovedRowsOrColumnsDTO}.
     *
     * @throws TableNotFoundException   If no table exists for the given {@code tableId}.
     * @throws ColumnNotFound          If any UUID in {@code idsToMove} does not correspond
     *                                  to an existing column in that table.
     * @throws IndexOutOfBoundsException If {@code fromIndex} or {@code toIndex} is
     *                                   outside the valid range [{@code 0}, {@code columnCount}).
     */
    @Transactional
    public MovedRowsOrColumnsDTO moveColumnsIndexes(UUID tableId, MovesRowsOrColumnsDTO moveColumnsDTO) {
        ensureTableExistsOrThrow(tableId);

        int columnsAmount = columnDAO.getColumnNumber(tableId);

        if (!canMoveRowOrColumn(moveColumnsDTO.fromIndex(), moveColumnsDTO.toIndex(), columnsAmount))
            return new MovedRowsOrColumnsDTO(new ArrayList<>(), 0);

        moveColumnsDTO.idsToMove().forEach((UUID id) -> this.ensureColumnExistsOrThrow(tableId, id));

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
