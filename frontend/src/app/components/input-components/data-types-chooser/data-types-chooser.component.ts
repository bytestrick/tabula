import {Component, ElementRef, inject, ViewChild} from '@angular/core';
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

  @ViewChild('searchBar') searchBar!: ElementRef;

  protected dataTypesRegistry: DataTypeRegistryService = inject(DataTypeRegistryService);


  protected override beforeShowUp(): void {}


  override grabFocus(): void {
    this.searchBar.nativeElement.focus();
  }


  onCreateDataType(dataType: IDataType): void {
    this.confirmInput(dataType);
  }


  protected override onHiddenWithLeftClick(): void {}


  protected override onHiddenWithRightClick(): void {}
}
