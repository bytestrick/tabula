import {Component} from '@angular/core';
import { ModalComponent } from '../modal.component';
import {FormsModule} from '@angular/forms';
import {TableCardComponent} from '../../table-card/table-card.component';
import {HomeMediatorService} from '../../../services/home/home-mediator.service';

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


  constructor(private homeMediatorService: HomeMediatorService) {
    super();
    homeMediatorService.setModalCreateTableCard(this);
  }


  protected override doOnSubmit(): void {
    let newTableCard: TableCardComponent = this.homeMediatorService.createTableCard();
    newTableCard.setTitle(this.titleField);
    newTableCard.setDescription(this.descriptionField);
  }
}
