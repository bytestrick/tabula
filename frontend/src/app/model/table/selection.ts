/**
 * Class that manages a collection of selected items identified by strings.
 */
export class Selection {
  /**
   * A Set of currently selected IDs.
   */
  private selectedIds: Set<string> = new Set<string>();

  /**
   * Adds the specified ID to the selection.
   * If the ID is already present, this method has no effect.
   *
   * @param id The identifier to select or update.
   */
  select(id: string): void {
    this.selectedIds.add(id);
  }

  /**
   * Removes the specified ID from the selection.
   * If the ID is not present in the Set, this method has no effect.
   *
   * @param id The identifier to deselect.
   */
  deselect(id: string): void {
    this.selectedIds.delete(id);
  }

  /**
   * Checks whether a given ID is currently selected.
   *
   * @param id The identifier to check.
   * @returns {@code true} if the ID is in the Set of selected IDs, {@code false} otherwise.
   */
  isSelected(id: string): boolean {
    return this.selectedIds.has(id);
  }

  /**
   * Returns the total number of items currently selected.
   *
   * @returns The count of selected IDs.
   */
  getSelectionNumber(): number {
    return this.selectedIds.size;
  }

  /**
   * Returns an array containing all currently selected IDs.
   * The array is generated from the keys of the internal Set.
   *
   * @returns An array of strings representing the selected IDs.
   */
  getSelectedIds(): string[] {
    return Array.from(this.selectedIds.keys());
  }

  /**
   * Clears the entire selection, removing all IDs from the internal Set.
   */
  deselectAll(): void {
    this.selectedIds.clear();
  }
}
