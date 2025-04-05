import {Component, ComponentRef, EventEmitter, OnDestroy, Output, ViewContainerRef} from '@angular/core';
import {HomeService} from '../home.service';
import {TableCard} from './table-card.interface';
import {Subscription} from 'rxjs';


@Component({
  selector: 'app-table-card',
  standalone: true,
  imports: [],
  templateUrl: './table-card.component.html',
  styleUrl: './table-card.component.css'
})
export class TableCardComponent implements OnDestroy {

  @Output('editTableCard') editTableCard: EventEmitter<TableCardComponent> = new EventEmitter;
  private ref!: ComponentRef<TableCardComponent>;
  private id?: string;
  protected title: string = "Title";
  protected description: string = "Description";
  private isInit: boolean = false;
  private subscription!: Subscription;


  constructor(private homeService: HomeService) {}


  init(tableCard: TableCard): void {
    if (this.isInit) return;
    this.isInit = true;

    this.id = tableCard.id;
    this.title = tableCard.title;
    this.description = tableCard.description;
  }

  static create(containerRef: ViewContainerRef): TableCardComponent {
    let newTableCard: ComponentRef<TableCardComponent> = containerRef.createComponent(TableCardComponent);
    newTableCard.instance.ref = newTableCard;
    containerRef.insert(newTableCard.hostView, 0);

    return newTableCard.instance;
  }

  getId(): string | undefined {
    return this.id;
  }

  getTitle(): string {
    return this.title;
  }

  getDescription(): string {
    return this.description;
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  onDelete(): void {
    if (this.id) {
      this.subscription = this.homeService.deleteTableCard(this.id).subscribe({
        next: (data: string): void => {
          console.log(data)
          this.ref.destroy();
        },
        error: (err: any): void => console.log(err)
      });
    }
  }

  onEdit(): void {
    this.editTableCard.emit(this);
  }

  edit(tableCard: TableCard): void {
    this.title = tableCard.title;
    this.description = tableCard.description;
  }
}
