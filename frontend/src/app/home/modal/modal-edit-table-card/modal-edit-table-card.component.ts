import { Component } from '@angular/core';
import {ModalComponent} from '../modal.component';
import {TableCardComponent} from '../../table-card/table-card.component';
import {FormsModule} from '@angular/forms';
import {HomeMediatorService} from '../../home-mediator.service';

@Component({
  selector: 'app-modal-edit-table-card',
  standalone: true,
  imports: [
    FormsModule
  ],
  templateUrl: '../modal.component.html',
  styleUrl: './modal-edit-table-card.component.css'
})
export class ModalEditTableCardComponent extends ModalComponent {
  protected override title: string = 'Edit table card';
  protected override actionName: string = 'Edit';
  private tableCardInEdit: TableCardComponent | undefined;


  constructor(private homeMediatorService: HomeMediatorService) {
    super();
    homeMediatorService.setModalEditTableCard(this);
  }


  protected doOnSubmit(): void {
    if (this.tableCardInEdit) {
      this.tableCardInEdit.setTitle(this.titleField);
      this.tableCardInEdit.setDescription(this.descriptionField);
    }
  }

  public editTableCard(tableCardComponent: TableCardComponent): void {
    this.titleField = tableCardComponent.getTitle();
    this.descriptionField = tableCardComponent.getDescription();
    this.tableCardInEdit = tableCardComponent
  }
}
