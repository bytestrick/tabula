import { Component } from '@angular/core';
import {IInputComponent} from '../../model/input-component.interface';

@Component({
  selector: 'app-text-input',
  standalone: true,
  imports: [],
  templateUrl: './text-input.component.html',
  styleUrl: './text-input.component.css'
})
export class TextInputComponent implements IInputComponent{

  getInput(): void {
    throw new Error('Method not implemented.');
  }
}
