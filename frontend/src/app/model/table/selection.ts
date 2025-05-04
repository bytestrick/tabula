export class Selection {

  private idToIndex: Map<string, number> = new Map<string, number>();


  selectOrUpdate(id: string, index: number): void {
    this.idToIndex.set(id, index);
  }


  deselect(id: string): void {
    this.idToIndex.delete(id);
  }


  isSelected(id: string): boolean {
    if (this.idToIndex.get(id))
      return true;

    return false;
  }


  getSelectionNumber(): number {
    return this.idToIndex.size
  }


  getSelectedIndexes(): number[] {
    return Array.from(this.idToIndex.values());
  }


  getSelectedIds(): string[] {
    return Array.from(this.idToIndex.keys());
  }


  doForEachIndexSelected(fn: (i: number) => void): void {
    for (let i of this.idToIndex.values())
      fn(i);
  }
}
