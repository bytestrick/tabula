import {Component, ElementRef, inject, ViewChild} from '@angular/core';
import {BaseInputComponent} from '../base-input-component';
import {NgForOf} from '@angular/common';
import {InfoComponent} from '../info-component/info.component';
import {DataTypeRegistryService} from '../../../services/data-type-registry.service';

@Component({
  selector: 'tbl-monetary-input',
  standalone: true,
  imports: [
    NgForOf,
    InfoComponent
  ],
  templateUrl: './monetary-input.component.html',
  styleUrl: './monetary-input.component.css'
})
export class MonetaryInputComponent extends BaseInputComponent {

  @ViewChild('input') protected input!: ElementRef;

  private value: string = '';

  protected readonly symbol: string[] = ['$', '€', '£'];
  protected currentSymbol: string = this.symbol[0];

  private readonly MONETARY_ID: number = DataTypeRegistryService.MONETARY_ID;


  protected override onPopUpShowUp(): void {
    this.grabFocus();

    this.currentSymbol = (this.startingValue || this.currentSymbol).charAt(0);

    const valueWithoutSymbol: string = (this.startingValue || '').slice(1, (this.startingValue || '').length);
    this.input.nativeElement.value = valueWithoutSymbol;
    this.value = valueWithoutSymbol;
  }


  private setInput(value: string): void {
    if (value === '') {
      this.confirmInputDataType('', this.MONETARY_ID);
      return;
    }

    if (!isNaN(Number(value))) {
      let s: string[] = value.split('.');

      if (s.length == 1)
        value = `${s[0]}.00`;
      else {
        const decimalSize: number = 2;
        let decimal: string = s[1].slice(0, decimalSize);
        value = `${s[0]}.${decimal}${'0'.repeat(decimalSize - decimal.length)}`;
      }

      value = this.currentSymbol + value;

      this.confirmInputDataType(value, this.MONETARY_ID);
    }
    else
      this.confirmInputDataType(this.startingValue || '', this.MONETARY_ID);
  }


  onKeyPressed(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.setInput(this.value);
    }
    else if (event.key === 'Delete') {
      this.abortInput();
    }
  }


  onInsertion(event: Event): void {
    this.value = (event.target as HTMLInputElement).value;
  }


  protected grabFocus(): void {
    this.input.nativeElement.focus();
  }


  protected override onPopUpHiddenWithLeftClick(): void {
    this.setInput(this.value);
  }


  protected override onPopUpHiddenWithRightClick(): void {
    this.abortInput();
  }


  onChangeSymbol(s: string): void {
    this.currentSymbol = s;
  }
}
