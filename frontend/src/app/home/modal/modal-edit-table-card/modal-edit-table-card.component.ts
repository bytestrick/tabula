import { Component } from '@angular/core';
import {ModalComponent} from '../modal.component';

@Component({
  selector: 'app-modal-edit-table-card',
  standalone: true,
  imports: [],
  templateUrl: '../modal.component.html',
  styleUrl: './modal-edit-table-card.component.css'
})
export class ModalEditTableCardComponent extends ModalComponent {
  protected override title: string = 'Edit table card';
  protected override actionName: string = 'Edit';

  protected doOnSubmit(): void {

  }
}
