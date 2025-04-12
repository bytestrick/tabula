import {Component, OnInit} from '@angular/core';
import {enableTooltips} from '../../../tooltips';

@Component({
  selector: 'tbl-info',
  standalone: true,
  imports: [],
  templateUrl: './info.component.html',
  styleUrl: './info.component.css'
})
export class InfoComponent implements OnInit {

  ngOnInit(): void {
    enableTooltips();
  }
}
