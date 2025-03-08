import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  Renderer2,
  ViewChild
} from '@angular/core';
import {NgStyle} from '@angular/common';

@Component({
  selector: 'app-table-organizer',
  standalone: true,
  imports: [
    NgStyle
  ],
  templateUrl: './table-organizer.component.html',
  styleUrl: './table-organizer.component.css'
})
export class TableOrganizerComponent implements AfterViewInit {

  @ViewChild('container', { static: true }) container!: ElementRef;
  @Input() rowIndicators: boolean = true;
  @Input() showOrganizer: boolean = false;


  constructor(private renderer: Renderer2) {}


  ngAfterViewInit(): void {
    this.renderer.addClass(this.container.nativeElement, this.rowIndicators ? 'row-indicators' : 'column-indicators');
  }


  onInsertDown(): void {

  }


  onSelect(event: Event): void {

  }


  onDrag(): void {

  }
}
