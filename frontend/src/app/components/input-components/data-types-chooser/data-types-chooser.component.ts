import {Component, ElementRef, ViewChild} from '@angular/core';
import {BaseInputComponent} from '../base-input-component';
import {DataTypeRegistryService} from '../../../services/data-type-registry.service';
import {NgForOf} from '@angular/common';
import {IDataType} from '../../../model/data-types/i-data-type';

@Component({
  selector: 'app-data-types-chooser',
  standalone: true,
  imports: [
    NgForOf
  ],
  templateUrl: './data-types-chooser.component.html',
  styleUrl: './data-types-chooser.component.css'
})
export class DataTypesChooserComponent extends BaseInputComponent {

  @ViewChild('searchBar', { static: true }) searchBar!: ElementRef;

  constructor(protected dataTypesRegistry: DataTypeRegistryService) {
    super();
  }


  protected override beforeShowUp(): void {}


  override grabFocus(): void {
    this.searchBar.nativeElement.focus();
  }


  onCreateDataType(dataType: IDataType): void {
    this.confirmInput(dataType);
  }
}
