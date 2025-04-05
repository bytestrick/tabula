import {
  Component,
  ViewChild,
  ViewContainerRef,
  AfterViewInit,
  OnInit,
} from '@angular/core';
import { CreateTableCardComponent } from './create-table-card/create-table-card.component';
import {FormsModule} from '@angular/forms';
import {HomeMediatorService} from './home-mediator.service';
import {HomeService} from './home.service';
import {TableCardComponent} from './table-card/table-card.component';
import {TableCard} from './table-card/table-card.interface';
import {NgIf} from '@angular/common';
import {FormCreateTableCardComponent} from './modal-form/form-create-table-card/form-create-table-card.component';
import {FormEditTableCardComponent} from './modal-form/form-edit-table-card/form-edit-table-card.component';

@Component({
  selector: 'app-table-cards-container',
  standalone: true,
  imports: [
    CreateTableCardComponent,
    FormsModule,
    NgIf,
    FormCreateTableCardComponent,
    FormEditTableCardComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements AfterViewInit, OnInit {

  @ViewChild('tableCardContainer', { read: ViewContainerRef }) private tableCardContainerRef!: ViewContainerRef;
  protected currentPage: number = 1;
  private pageSize: number = 20;
  public isLoading: boolean = false;


  constructor(private homeMediatorService: HomeMediatorService, private homeService: HomeService) {}


  public ngOnInit(): void {
    this.loadMoreTableCards(this.currentPage - 1, this.pageSize);
  }

  public ngAfterViewInit(): void {
    this.homeMediatorService.setTableCardContainerRef(this.tableCardContainerRef);
    this.homeMediatorService.setHome(this);
  }

  public loadMoreTableCards(page: number, size: number): void {
    this.isLoading = true;
    this.homeService.loadTableCard(page, size).subscribe({
      next: (data: TableCard[]): void => {
        console.log('TableCard loaded successfully');
        console.debug(data);

        this.addTableCards(data);

        this.isLoading = false;
      },
      error: (err: any): void => console.error('Error:', err)
    });
  }

  public addTableCards(tableCard: TableCard[]): void {
    if (tableCard.length !== 0) {
      this.tableCardContainerRef.clear();
    }

    tableCard.forEach((tc: TableCard): void => {
      let tableCard: TableCardComponent = this.homeMediatorService.createTableCard(tc.id);
      tableCard.setTitle(tc.title);
      tableCard.setDescription(tc.description);
    });
  }

  public onPreviousPage(): void {
    if (this.currentPage - 1 >= 1) {
      this.currentPage -= 1;
      this.loadMoreTableCards(this.currentPage - 1, this.pageSize);
    }
  }

  public onNextPage(): void {
    console.log(typeof this.currentPage)
    this.currentPage = Number(this.currentPage) + 1;
    this.loadMoreTableCards(this.currentPage - 1, this.pageSize);
  }

  public onManualPageSelected(): void {
    this.loadMoreTableCards(this.currentPage - 1, this.pageSize);
  }
}
