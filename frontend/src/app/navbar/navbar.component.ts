import {Component, ElementRef, ViewChild, viewChild} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {NavbarService} from './navbar.service';
import {NgIf} from '@angular/common';
import {TableCard} from '../home/table-card/table-card.interface';

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
  private timer: any;

  constructor(private navbarService: NavbarService) {

  }

  protected onSearchSubmit(searchForm: HTMLFormElement): void {
    this.search(this.searchContent);
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

  protected onKeyUp(): void {
    clearTimeout(this.timer);
    this.timer = setTimeout((): void => {
      this.search(this.searchContent);
    }, 500);
  }

  public search(text: string): void {
    this.navbarService.fuzzySearch(text).subscribe({
      next: (tableCards: TableCard[]): void => {
        console.debug(tableCards);
        // this.homeMediatorService.addTableCards(tableCards);
      },
      error: (err: any): any => console.debug(err)
    });
  }
}
