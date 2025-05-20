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
import {DatePipe} from '@angular/common';
import {PrettyDatePipe} from '../pretty-date.pipe';
import {Router} from '@angular/router';
import {ToastService} from '../../toast/toast.service';
import {ConfirmDialogService} from '../../confirm-dialog/confirm-dialog.service';

@Component({
  selector: 'tbl-table-card',
  imports: [DatePipe, PrettyDatePipe],
  templateUrl: './table-card.component.html',
  styles: `
    .card:active {
      border-color: var(--bs-btn-active-border-color)
    }
  `
})
export class TableCardComponent implements OnDestroy {
  @Output('editTableCard') editTableCard: EventEmitter<TableCardComponent> = new EventEmitter;
  private componentRef!: ComponentRef<TableCardComponent>;

  private id?: string;
  protected title: string = "Title";
  protected description: string = "Description";
  protected creationDate?: Date;
  protected lastEditDate?: Date;

  private isInit: boolean = false;
  private subscription!: Subscription;

  private toast = inject(ToastService);
  private confirmDialog = inject(ConfirmDialogService);
  private homeService = inject(HomeService);
  private router: Router = inject(Router);


  init(tableCard: TableCard): TableCardComponent {
    if (this.isInit) return this;
    this.isInit = true;
    this.id = tableCard.id;
    this.title = tableCard.title;
    this.description = tableCard.description;
    this.creationDate = tableCard.creationDate ? new Date(tableCard.creationDate + 'Z') : undefined;
    this.lastEditDate = tableCard.lastEditDate ? new Date(tableCard.lastEditDate + 'Z') : this.creationDate;
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

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  insert(parent: ViewContainerRef, index?: number) {
    parent.insert(this.componentRef.hostView, index);
  }

  onDelete() {
    this.confirmDialog.show({
      title: 'Delete the table?',
      description: 'You are about to delete ' + this.title + '.',
      confirmButton: {text: 'Delete', background: 'btn-danger'}
    }).subscribe((confirm: boolean) => {
      if (confirm) {
        if (!this.id) return;

        this.subscription = this.homeService.deleteTableCard(this.id).subscribe({
          next: () => {
            this.toast.show({
              title: 'Table Deleted',
              body: `The table has been successfully deleted.`,
              icon: 'bi bi-trash-fill',
              background: 'success',
            });
            this.componentRef.destroy();
          },
          error: () => {
            this.toast.show({
              title: 'Table Not Deleted',
              body: 'An error occurred the table was not deleted.\nPlease try again later.',
              icon: 'x-circle-fill',
              background: 'danger',
            });
          }
        });
      }
    });
  }

  onEdit() {
    this.editTableCard.emit(this);
  }

  edit(tableCard: TableCard) {
    this.title = tableCard.title;
    this.description = tableCard.description;
    this.lastEditDate = tableCard.lastEditDate;
  }

  onOpenCard(): void {
    this.router.navigate(['/tables', this.id])
      .catch(err => console.error(err));
  }
}
