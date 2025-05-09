export class Selection {

  private selectedIds: Set<string> = new Set<string>();


  selectOrUpdate(id: string): void {
    this.selectedIds.add(id);
  }


  deselect(id: string): void {
    this.selectedIds.delete(id);
  }


  isSelected(id: string): boolean {
    if (this.selectedIds.has(id))
      return true;

    return false;
  }


  getSelectionNumber(): number {
    return this.selectedIds.size
  }


  getSelectedIds(): string[] {
    return Array.from(this.selectedIds.keys());
  }
}
