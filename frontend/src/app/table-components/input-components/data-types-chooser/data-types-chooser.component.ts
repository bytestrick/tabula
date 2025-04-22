import {Component, ElementRef, inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {BaseInputComponent} from '../base-input-component';
import {DataTypeRegistryService} from '../../../services/data-type-registry.service';
import {NgForOf, NgIf} from '@angular/common';
import {IDataType} from '../../../model/data-types/i-data-type';
import {debounceTime, distinctUntilChanged, Subscription, switchMap} from 'rxjs';
import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';

@Component({
  selector: 'tbl-data-types-chooser',
  standalone: true,
  imports: [
    NgForOf,
    NgIf,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './data-types-chooser.component.html',
  styleUrl: './data-types-chooser.component.css'
})
export class DataTypesChooserComponent extends BaseInputComponent implements OnInit, OnDestroy {

  @ViewChild('searchBar') searchBar!: ElementRef;

  private dataTypeService: DataTypeRegistryService = inject(DataTypeRegistryService);

  private searchCtrlSub$: Subscription | undefined;

  protected searchCtrl: FormControl = new FormControl('');
  protected dataTypes: IDataType[] = [];


  ngOnInit(): void {
    this.searchCtrlSub$ = this.searchCtrl.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      switchMap(term => this.dataTypeService.getDataType(term || ''))
    ).subscribe({ next: dataTypes => this.dataTypes = dataTypes });

    this.dataTypeService.getDataType()
      .subscribe({ next: dataTypes => this.dataTypes = dataTypes })
  }


  ngOnDestroy(): void {
    if (this.searchCtrlSub$)
      this.searchCtrlSub$.unsubscribe();
  }


  protected override beforeShowUp(): void {
    this.grabFocus();
  }


  protected grabFocus(): void {
    this.searchBar.nativeElement.focus();
  }


  onSearch(term: string): void {
    this.dataTypeService.getDataType(term)
      .subscribe({ next: dataTypes => this.dataTypes = dataTypes });
  }


  onCreateDataType(dataType: IDataType): void {
    this.confirmInput(dataType);
  }


  protected override onHiddenWithLeftClick(): void {}


  protected override onHiddenWithRightClick(): void {}
}
