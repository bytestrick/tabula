import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import {DataTypeCellComponent} from '../data-type-cell/data-type-cell.component';
import {HeaderCell} from '../../../../model/table/header-cell';
import {Cell} from '../../../../model/table/cell';

@Component({
  selector: 'app-cell-wrapper',
  standalone: true,
  imports: [],
  template: `
    <div #borders>
      <ng-container #container></ng-container>
    </div>`,
  styles: [`
    div {
      display: flex;
      overflow: auto;
      align-items: center;
      margin: var(--cell-table-margin);
      height: var(--cell-table-min-height);
    }
  `]
})
export class CellWrapperComponent implements AfterViewInit {

  @Input() cell: Cell | null = null;
  @Input() headerCell: HeaderCell | null = null;
  @ViewChild('container', { read: ViewContainerRef, static: true }) container!: ViewContainerRef;
  @ViewChild('borders', { static: true }) bordersToHighLight!: ElementRef;


  ngAfterViewInit(): void {
    if (this.cell !== null) {
      this.cell.cellRef = this.container.createComponent(this.cell.cellDataType.getCellComponent());
    }

    if (this.headerCell !== null) {
      this.headerCell.cellRef = this.container.createComponent(DataTypeCellComponent);
      this.headerCell.cellRef?.setInput('iconName', this.headerCell.columnDataType.getIconName());
    }
  }
}

