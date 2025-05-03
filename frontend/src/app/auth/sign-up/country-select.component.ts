import {Component, inject, OnInit} from '@angular/core';
import {NgForOf} from '@angular/common';
import {AbstractControl, FormControl, ReactiveFormsModule} from '@angular/forms';
import {HttpClient} from '@angular/common/http';

interface Country {
  name: string,
  flag: string,
  code: string,
  dialCode: number
}

@Component({
  selector: 'tbl-country-select',
  imports: [NgForOf, ReactiveFormsModule],
  template: `
    <div class="row mb-3">
      <label for="country" class="form-label p-0">Country</label>
      <div class="input-group p-0 has-validation position-relative">
        <select id="country" class="form-select" [formControl]="country"
                [class.is-valid]="country.touched && country.valid"
                [class.is-invalid]="country.touched && country.invalid">
          <option value="-1" disabled>Select your country</option>
          <option [value]="i" *ngFor="let country of countries; index as i">
            {{ country.name.length > 26 ? country.name.substring(0, 26) + '…' : country.name }}&nbsp;
            {{ country.flag }}
          </option>
        </select>
        <div class="invalid-tooltip">Country required</div>
      </div>
    </div>
  `
})
export class CountrySelectComponent implements OnInit {
  private http = inject(HttpClient);
  readonly country = new FormControl(-1,
    [(select: AbstractControl) => select.value === -1 ? {required: true} : null]);
  private _countries: Country[] = [];

  get countries(): Country[] {
    return this._countries;
  }

  ngOnInit() {
    this.http.get<Country[]>('countries.json').subscribe({
      next: data => this._countries = data,
      error: console.error,
    });
  }
}
