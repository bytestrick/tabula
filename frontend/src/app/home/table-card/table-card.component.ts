import {
  Component,
  ComponentRef,
  createComponent, EnvironmentInjector,
  EventEmitter, inject,
  OnDestroy,
  Output,
  ViewContainerRef
} from '@angular/core';
import {HomeService} from '../home.service';
import {TableCard} from './table-card.interface';
import {Subscription} from 'rxjs';
import {DatePipe, NgIf} from '@angular/common';
import {PrettyDatePipe} from '../pretty-date.pipe';
import {ToastService} from '../../toast/toast.service';


@Component({
  selector: 'tbl-table-card',
  standalone: true,
  imports: [
    DatePipe,
    PrettyDatePipe
  ],
  templateUrl: './table-card.component.html',
  styleUrl: './table-card.component.css'
})
export class TableCardComponent implements OnDestroy {

  @Output('editTableCard') editTableCard: EventEmitter<TableCardComponent> = new EventEmitter;
  private componentRef!: ComponentRef<TableCardComponent>;

  private id?: string;
  protected title: string = "Title";
  protected description: string = "Description";
  protected creationDate?: Date;
  protected lastEditDate?: Date;
  private tableId?: string;

  private isInit: boolean = false;
  private subscription!: Subscription;
  private toast: ToastService = inject(ToastService);


  constructor(private homeService: HomeService) {}


  init(tableCard: TableCard): TableCardComponent {
    if (this.isInit) return this;
    this.isInit = true;

    this.id = tableCard.id;
    this.title = tableCard.title;
    this.description = tableCard.description;
    this.creationDate = tableCard.creationDate ? new Date(tableCard.creationDate + 'Z') : undefined;
    this.lastEditDate = tableCard.lastEditDate ? new Date(tableCard.lastEditDate + 'Z') : this.creationDate;
    this.tableId = tableCard.id;
    return this;
  }

  static create(injector: EnvironmentInjector): ComponentRef<TableCardComponent> {
    const newTableCardRef: ComponentRef<TableCardComponent> = createComponent(TableCardComponent, {
      environmentInjector: injector
    });
    newTableCardRef.instance.componentRef = newTableCardRef;
    return newTableCardRef;
  }

  toTableCard(): TableCard {
    return {
      id: this.getId(),
      title: this.getTitle(),
      description: this.getDescription(),
      creationDate: this.getCreationDate(),
      lastEditDate: this.getLastEditDate()
    }
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

  getCreationDate(): Date | undefined {
    return this.creationDate;
  }

  getLastEditDate(): Date | undefined {
    return this.lastEditDate;
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  insert(parent: ViewContainerRef, index?: number): void {
    parent.insert(this.componentRef.hostView, index);
  }

  onDelete(): void {
    if (!this.id) return;

    this.subscription = this.homeService.deleteTableCard(this.id).subscribe({
      next: (data: string): void => {
        this.toast.show({
          title: 'Table Deleted',
          body: `The table has been successfully deleted.`,
          icon: 'bi bi-trash-fill',
          background: 'success',
        });
        this.componentRef.destroy();
      },
      error: (err: any): void => {
        this.toast.show({
          title: 'Table Not Deleted',
          body: 'An error occurred the table was not deleted.\nPlease try again later.',
          icon: 'x-circle-fill',
          background: 'danger',
        });
      }
    });
  }

  onEdit(): void {
    this.editTableCard.emit(this);
  }

  edit(tableCard: TableCard): void {
    this.title = tableCard.title;
    this.description = tableCard.description;
    this.lastEditDate = tableCard.lastEditDate;
  }
}
