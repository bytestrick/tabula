import {Component, ViewChild, ViewContainerRef, ComponentRef, AfterViewInit, ElementRef, OnInit} from '@angular/core';
import { CreateTableCardComponent } from './create-table-card/create-table-card.component';
import {FormsModule} from '@angular/forms';
import {ModalCreateTableCardComponent} from './modal/modal-create-table-card/modal-create-table-card.component';

@Component({
  selector: 'app-table-cards-container',
  standalone: true,
  imports: [
    CreateTableCardComponent,
    FormsModule,
    ModalCreateTableCardComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements AfterViewInit {
  @ViewChild('tableCardContainer', { read: ViewContainerRef }) private tableCardContainerRef!: ViewContainerRef;
  @ViewChild(ModalCreateTableCardComponent) private modalCreateTableCard!: ModalCreateTableCardComponent;

  public ngAfterViewInit(): void {
    this.modalCreateTableCard.setTableCardContainerRef(this.tableCardContainerRef);
  }
}
