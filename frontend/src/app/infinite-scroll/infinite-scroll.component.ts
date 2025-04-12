import {
  ComponentRef,
  ViewContainerRef,
} from '@angular/core';

export abstract class InfiniteScrollComponent<T extends ComponentRef<any>> {

  protected abstract viewContainerRef: ViewContainerRef;
  protected maxElementOnPage: number = 50;
  private elements: T[] = [];
  protected isLoading: boolean = false;

  private isDataFetched: boolean = true;


  loadMoreElements(): void {
    if (!this.isDataFetched) return;

    this.isLoading = true;
    this.isDataFetched = false;
    this.fetchElements();
  }

  protected abstract fetchElements(): void;

  protected provideElements(elements: T[]): void {
    this.isDataFetched = true;
    this.isLoading = false;
    this.appendElementsToDOM(elements);
  }

  private appendElementsToDOM(elements: T[]): void {
    elements.forEach((componentRef: T): void => {
      this.elements.push(componentRef);
      this.viewContainerRef.insert(componentRef.hostView);
    });
  }

  isEmpty(): boolean {
    return this.elements.length === 0;
  }

  getElementAt(index: number): T | undefined {
    if (index < 0 || index >= this.elements.length) {
      return undefined;
    }
    return this.elements[index];
  }

  getFirstElement(): T | undefined {
    return this.getElementAt(0);
  }

  getLastElement(): T | undefined {
    return this.getElementAt(this.elements.length - 1);
  }
}
