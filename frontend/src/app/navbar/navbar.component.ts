import {Component, ElementRef, ViewChild, viewChild} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {NavbarService} from './navbar.service';
import {HttpErrorResponse} from '@angular/common/http';
import {TableCardComponent} from '../home/table-card/table-card.component';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    FormsModule,
    NgIf
  ],

  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  protected searchContent: string = '';
  protected searchFieldOnFocus: boolean = false;
  @ViewChild('searchField', { static: false }) private searchField!: ElementRef;

  constructor(private navbarService: NavbarService) {}

  protected onSearchSubmit(searchForm: HTMLFormElement): void {
    // this.navbarService.prova().subscribe({
    //   next: data => console.log('Success:', data),
    //   error: err => console.error('Error:', err)
    // });
  }

  protected clearSearch(): void {
    this.searchContent = '';
    this.searchField.nativeElement.focus();
  }

  protected onFocusIn(): void {
    this.searchFieldOnFocus = true;
  }

  protected onFocusOut(): void {
    this.searchFieldOnFocus = false;
  }
}
