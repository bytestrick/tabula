import { Component } from '@angular/core';
import {TableComponent} from '../table-components/table/table.component';
import {NavbarComponent} from '../navbar/navbar.component';

@Component({
  selector: 'tbl-table-page',
  imports: [
    TableComponent,
    NavbarComponent
  ],
  templateUrl: './table-page.component.html',
  styleUrl: './table-page.component.css'
})
export class TablePageComponent {

}
