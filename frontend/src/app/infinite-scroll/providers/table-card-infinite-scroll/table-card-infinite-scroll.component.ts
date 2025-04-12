import {
  Component,
  ComponentRef,
  EnvironmentInjector, Input,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import {InfiniteScrollComponent} from '../../infinite-scroll.component';
import {TableCardComponent} from '../../../home/table-card/table-card.component';
import {IntersectionListenerDirective} from '../../intersection-listener.directive';
import {NgIf} from '@angular/common';
import {HomeService} from '../../../home/home.service';
import {TableCard} from '../../../home/table-card/table-card.interface';
import {Observable} from 'rxjs';
import {HomeComponent} from '../../../home/home.component';

@Component({
  selector: 'app-table-card-infinite-scroll',
  standalone: true,
  imports: [
    IntersectionListenerDirective,
    NgIf
  ],
  templateUrl: '../../infinite-scroll.component.html',
  styleUrl: './table-card-infinite-scroll.component.css'
})
export class TableCardInfiniteScrollComponent extends InfiniteScrollComponent<ComponentRef<TableCardComponent>> {

  @ViewChild('content', { read: ViewContainerRef }) protected override viewContainerRef!: ViewContainerRef;
  @Input() homeComponent!: HomeComponent;
  private nElementToFetch: number = 10;


  constructor(private homeService: HomeService,
              private injector: EnvironmentInjector) {
    super();
  }

  protected fetchElements(): void {
    let request: Observable<TableCard[]>;

    if (this.isEmpty()) {
      request = this.homeService.loadTableCards(this.nElementToFetch);
    }
    else {
      const id: string | undefined = this.getLastElement()?.instance.getId();
      if (!id) return;
      request = this.homeService.loadNextTableCards(id, this.nElementToFetch);
    }

    request.subscribe({
      next: (data: TableCard[]): void => {
        const tableCardsCmp: ComponentRef<TableCardComponent>[] = this.createComponentsFromData(data);
        this.provideElements(tableCardsCmp);
      },
      error: (err: any): void => {
        console.debug(err);
        this.provideElements([]);
      }
    });
  }

  private createComponentsFromData(data: TableCard[]): ComponentRef<TableCardComponent>[] {
    return data.map((tableCard: TableCard): ComponentRef<TableCardComponent> => {
      const tableCardCmpRef: ComponentRef<TableCardComponent> = TableCardComponent.create(this.injector);
      tableCardCmpRef.instance.init(tableCard);

      tableCardCmpRef.instance.editTableCard.subscribe((tableCardCmp: TableCardComponent): void => {
        this.homeComponent.editTableCard(tableCardCmp);
      })

      return tableCardCmpRef;
    });
  }
}
