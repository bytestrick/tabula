package com.github.bytestrick.tabula.repository.interfaces;

import java.util.List;
import java.util.UUID;

/**
 * DAO interface for retrieving sorted indexes of entities (rows, columns)
 * based on their UUIDs.
 */
public interface IndexesSortedDAO {

    /**
     * Returns a list of indexes for the entities identified by the given UUIDs,
     * sorted in ascending order.
     *
     * @param tableId The unique identifier of the table containing the entities.
     * @param ids     The list of UUIDs for which to retrieve indexes.
     * @return        A list of indexes (zero-based) sorted in ascending order.
     */
    List<Integer> findIndexesFromIdsSortedAscending(UUID tableId, List<UUID> ids);


    /**
     * Returns a list of indexes for the entities identified by the given UUIDs,
     * sorted in descending order.
     *
     * @param tableId The unique identifier of the table containing the entities.
     * @param ids     The list of UUIDs for which to retrieve indexes.
     * @return        A list of indexes (zero-based) sorted in descending order.
     */
    List<Integer> findIndexesFromIdsSortedDescending(UUID tableId, List<UUID> ids);
}
