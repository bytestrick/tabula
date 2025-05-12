import {Component, ElementRef, ViewChild} from '@angular/core';
import {BaseInputComponent} from '../base-input-component';
import {InfoComponent} from '../info-component/info.component';
import {DataTypeRegistryService} from '../../../services/data-type-registry.service';

@Component({
  selector: 'tbl-text-input',
  standalone: true,
  imports: [
    InfoComponent
  ],
  templateUrl: './textual-input.component.html',
})
export class TextualInputComponent extends BaseInputComponent {

  @ViewChild('input') input!: ElementRef<HTMLInputElement>;

  private text: string = '';

  private readonly TEXTUAL_ID: number = DataTypeRegistryService.TEXTUAL_ID;


  protected override onPopUpShowUp(): void {
    this.grabFocus();

    this.input.nativeElement.value = this.startingValue || '';
    this.text = this.startingValue || '';
  }


  onKeyPressed(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.confirmInputDataType(this.text, this.TEXTUAL_ID);
    }
    else if (event.key === 'Delete') {
      this.abortInput();
    }
  }


  onInsertion(event: Event): void {
    this.text = (event.target as HTMLInputElement).value;
  }


  protected grabFocus(): void {
    this.input.nativeElement.focus();
  }


  protected override onPopUpHiddenWithLeftClick(): void {
    this.confirmInputDataType(this.text, this.TEXTUAL_ID);
  }


  protected override onPopUpHiddenWithRightClick(): void {
    this.abortInput();
  }
}
