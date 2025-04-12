import {Component, OnInit} from '@angular/core';
import {enableTooltips} from '../../../../main';

@Component({
  selector: 'app-info',
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
