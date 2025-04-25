import {
  ComponentRef, ElementRef,
  ViewContainerRef,
} from '@angular/core';
import {NavbarComponent} from '../navbar/navbar.component';

export abstract class InfiniteScrollComponent<T extends ComponentRef<any>> {

  protected abstract contentViewRef: ViewContainerRef;
  protected abstract selectorElementRef: ElementRef;
  // TODO: fare in modo che in una pagina non sia possibile avere più di un tot di elementi
  // protected maxElementOnPage: number = 50;
  private elements: T[] = [];
  protected isLoading: boolean = false;
  private isDataFetched: boolean = true;


  loadMoreElements(): void {
    if (!this.isDataFetched || NavbarComponent.isSearching()) return;

    this.isLoading = true;
    this.isDataFetched = false;
    this.fetchElements();
  }

  protected abstract fetchElements(): void;

  public provideElements(elements: T[], fill: boolean = true): void {
    this.isDataFetched = true;
    this.isLoading = false;

    if (elements.length === 0) return;
    this.appendElementsToDOM(elements);

    // Carica finché la pagina non si riempie di elementi
    if (!this.selectorElementRef || !fill) return;
    if (this.selectorElementRef.nativeElement.scrollHeight <= window.innerHeight)
      this.fetchElements();
  }

  private appendElementsToDOM(elements: T[]): void {
    elements.forEach((componentRef: T): void => {
      this.elements.push(componentRef);
      this.contentViewRef.insert(componentRef.hostView);
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

  clearAll(): void {
    let element: T | undefined = this.elements.pop();
    while (element) {
      element.destroy();
      element = this.elements.pop();
    }
  }
}
