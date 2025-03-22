import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import {DataTypeCellComponent} from '../data-type-cell/data-type-cell.component';
import {HeaderCell} from '../../../../model/header-cell';
import {Cell} from '../../../../model/cell';

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
      overflow-x: auto;
      overflow-y: hidden;
      display: flex;
      align-items: center;

      padding: var(--cell-table-padding);
      height: var(--cell-table-min-height);
    }
  `]
})
export class CellWrapperComponent implements AfterViewInit {

  @Input() cell: Cell | null = null;
  @Input() headerCell: HeaderCell | null = null;
  @ViewChild('container', { read: ViewContainerRef, static: true }) container!: ViewContainerRef;
  @ViewChild('borders', { static: true }) bordersToHighLight!: ElementRef;
  @ViewChild('borders', { static: true }) areaToSelect!: ElementRef;


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

