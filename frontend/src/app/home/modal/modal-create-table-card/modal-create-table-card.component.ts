import {Component} from '@angular/core';
import { ModalComponent } from '../modal.component';
import {FormsModule} from '@angular/forms';
import {TableCardComponent} from '../../table-card/table-card.component';
import {HomeMediatorService} from '../../home-mediator.service';
import {HomeService} from '../../home.service';
import {TableCard} from '../../table-card/table-card.interface';

@Component({
  selector: 'app-modal-create-table-card',
  standalone: true,
  imports: [
    FormsModule
  ],
  templateUrl: '../modal.component.html',
  styleUrl: './modal-create-table-card.component.css'
})
export class ModalCreateTableCardComponent extends ModalComponent {
  protected override title: string = 'Create new table card';
  protected override actionName: string = 'Create';


  constructor(private homeMediatorService: HomeMediatorService, private homeService: HomeService) {
    super();
    homeMediatorService.setModalCreateTableCard(this);
  }

  protected override doOnSubmit(): void {
    this.createTableCard(this.titleField, this.descriptionField);
  }

  private createTableCard(title: string, description: string): void {
    this.homeService.createTableCard(title, description).subscribe({
      next: (data: TableCard): void => {
        console.log('TableCard created successfully');
        console.debug(data);

        let newTableCard: TableCardComponent = this.homeMediatorService.createTableCard(data.id);
        newTableCard.setTitle(this.titleField);
        newTableCard.setDescription(this.descriptionField);
      },
      error: (err: any): void => console.error(err)
    });
  }
}
