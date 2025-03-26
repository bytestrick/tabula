import {Component, ViewChild, ViewContainerRef, AfterViewInit, OnInit} from '@angular/core';
import { CreateTableCardComponent } from './create-table-card/create-table-card.component';
import {FormsModule} from '@angular/forms';
import {ModalCreateTableCardComponent} from './modal/modal-create-table-card/modal-create-table-card.component';
import {ModalEditTableCardComponent} from './modal/modal-edit-table-card/modal-edit-table-card.component';
import {HomeMediatorService} from './home-mediator.service';
import {HomeService} from './home.service';
import {TableCardComponent} from './table-card/table-card.component';
import {TableCard} from './table-card/table-card.interface';

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
export class HomeComponent implements AfterViewInit, OnInit {
  @ViewChild('tableCardContainer', { read: ViewContainerRef }) private tableCardContainerRef!: ViewContainerRef;


  constructor(private homeMediatorService: HomeMediatorService, private homeService: HomeService) {}


  public ngOnInit(): void {
    // popola la scermata con le tableCard presenti nel DB
    this.homeService.loadTableCard(0, 10).subscribe({
      next: (data: TableCard[]): void => {
        console.log('TableCard loaded successfully');
        console.debug(data);

        data.forEach((tc: TableCard): void => {
          let tableCard: TableCardComponent = this.homeMediatorService.createTableCard(tc.id);
          tableCard.setTitle(tc.title);
          tableCard.setDescription(tc.description);
        });
      },
      error: (err: any): void => console.error('Error:', err)
    });
  }

  public ngAfterViewInit(): void {
    this.homeMediatorService.setTableCardContainerRef(this.tableCardContainerRef);
  }
}
