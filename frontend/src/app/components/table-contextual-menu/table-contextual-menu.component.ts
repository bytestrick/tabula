import {
  AfterViewInit,
  Component,
  ElementRef, inject, Input, input, InputSignal,
  Renderer2, Signal, ViewChild, viewChild,
} from '@angular/core';
import {IPopUpContent} from '../../model/i-pop-up-content';
import {PopUp} from '../pop-up-component/pop-up.component';
import {Pair} from '../../model/pair';
import {ToastService} from '../../toast/toast.service';
import {TableService} from '../../services/table.service';

@Component({
  selector: 'tbl-contextual-menu',
  standalone: true,
  templateUrl: './table-contextual-menu.component.html',
  styleUrl: './table-contextual-menu.component.css'
})
export class TableContextualMenuComponent implements IPopUpContent, AfterViewInit {

  readonly TARGET_ROW: string = 'row';
  readonly TARGET_COLUMN: string = 'column';

  popUpRef?: PopUp | undefined;

  @ViewChild('defaultActionTarget') defaultActionTarget!: ElementRef;

  protected currentActionTarget: string = this.TARGET_ROW;

  private toastService: ToastService = inject(ToastService);
  private tableService: TableService = inject(TableService);

  private renderer: Renderer2 = inject(Renderer2);

  @Input() cellCord: Pair<number, number> = new Pair(this.tableService.INVALID_CELL_INDEX, this.tableService.INVALID_CELL_INDEX);


  onHidden(_action: string): void {}


  ngAfterViewInit(): void {
    this.renderer.setAttribute(this.defaultActionTarget.nativeElement,'checked', '');
  }


  beforeContentShowUp(): void {}


  onDelete(): void {
    this.popUpRef?.hide();

    switch (this.currentActionTarget) {
      case this.TARGET_ROW: {
        const rowI: number = this.cellCord.first;

        if (this.tableService.isRowSelected(rowI)) {
          this.tableService.deleteSelectedRow();
          return;
        }

        if (rowI == this.tableService.INVALID_CELL_INDEX) {
          this.toastService.actionNotAllowed('you can\'t delete this row');
        }
        else if (this.tableService.getRowsNumber() <= 1) {
          this.toastService.actionNotAllowed('There must be at least one row');
        }
        else {
          this.tableService.deleteRow(rowI);
        }
        break;
      }
      case this.TARGET_COLUMN: {
        const columnI: number = this.cellCord.second;

        if (this.tableService.isColumnSelected(columnI)) {
          this.tableService.deleteSelectedColumn();
          return;
        }

        if (columnI == this.tableService.INVALID_CELL_INDEX) {
          this.toastService.actionNotAllowed('you can\'t delete this column');
        }
        else if (this.tableService.getHeadersCellsAmount() <= 1) {
          this.toastService.actionNotAllowed('There must be at least one column');
        }
        else {
          this.tableService.deleteColumn(columnI);
        }
        break;
      }
    }
  }


  onDuplicate(): void {
    this.popUpRef?.hide();

    switch (this.currentActionTarget) {
      case this.TARGET_ROW: {
        const rowI: number = this.cellCord.first;

        if (rowI == this.tableService.INVALID_CELL_INDEX) {
          this.toastService.actionNotAllowed('you can\'t duplicate this row');
        }
        else {
          this.tableService.duplicateRow(rowI);
        }
        break;
      }
      case this.TARGET_COLUMN: {
        const columnI: number = this.cellCord.second;

        if (columnI == this.tableService.INVALID_CELL_INDEX) {
          this.toastService.actionNotAllowed('you can\'t duplicate this column');
        }
        else {
          this.tableService.duplicateColumn(columnI);
        }
        break;
      }
    }
  }


  onActionTargetChanged(newTarget: string): void {
    this.currentActionTarget = newTarget;
  }
}
