import {Component} from '@angular/core';
import {HomeMediatorService} from '../../services/home/home-mediator.service';

@Component({
  selector: 'app-create-table-card',
  standalone: true,
  imports: [],
  templateUrl: './create-table-card.component.html',
  styleUrl: './create-table-card.component.css'
})
export class CreateTableCardComponent {

  constructor(private homeMediatorService: HomeMediatorService) { }


  protected create(): void {
    this.homeMediatorService.showModalCreateTableCard();
  }
}
