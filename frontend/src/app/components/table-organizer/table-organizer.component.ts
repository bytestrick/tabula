import {
  AfterViewInit,
  Component,
  ElementRef, EventEmitter,
  Input, Output,
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

  @Output() addAt: EventEmitter<void> = new EventEmitter<void>;


  constructor(private renderer: Renderer2) {}


  ngAfterViewInit(): void {
    this.renderer.addClass(this.container.nativeElement, this.rowIndicators ? 'row-indicators' : 'column-indicators');
  }


  onSelect(event: Event): void {

  }


  onDrag(): void {

  }


  onAddAt(): void {
    this.addAt.emit();
  }
}
