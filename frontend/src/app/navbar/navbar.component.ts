import {Component, ElementRef, ViewChild, viewChild} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {NavbarService} from './navbar.service';
import {HttpErrorResponse} from '@angular/common/http';
import {TableCardComponent} from '../home/table-card/table-card.component';
import {NgIf} from '@angular/common';
import {debounceTime, distinctUntilChanged, Observable, pipe} from 'rxjs';
import {TableCard} from '../home/table-card/table-card.interface';
import {HomeMediatorService} from '../home/home-mediator.service';

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

  constructor(private navbarService: NavbarService, private homeMediatorService: HomeMediatorService) {

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
        this.homeMediatorService.addTableCards(tableCards);
      },
      error: (err: any): any => console.debug(err)
    });
  }
}
