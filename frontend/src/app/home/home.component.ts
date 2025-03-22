import {Component, ViewChild, ViewContainerRef, AfterViewInit} from '@angular/core';
import { CreateTableCardComponent } from './create-table-card/create-table-card.component';
import {FormsModule} from '@angular/forms';
import {ModalCreateTableCardComponent} from './modal/modal-create-table-card/modal-create-table-card.component';
import {ModalEditTableCardComponent} from './modal/modal-edit-table-card/modal-edit-table-card.component';
import {HomeMediatorService} from './home-mediator.service';

@Component({
  selector: 'app-table-cards-container',
  standalone: true,
  imports: [
    CreateTableCardComponent,
    FormsModule,
    ModalCreateTableCardComponent,
    ModalEditTableCardComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements AfterViewInit {
  @ViewChild('tableCardContainer', { read: ViewContainerRef }) private tableCardContainerRef!: ViewContainerRef;


  constructor(private homeMediatorService: HomeMediatorService) { }


  public ngAfterViewInit(): void {
    this.homeMediatorService.setTableCardContainerRef(this.tableCardContainerRef);
  }
}
