import {Component, ElementRef, EventEmitter, OnInit, Output, ViewChild} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {NavbarService, UserInfo} from './navbar.service';
import {NgClass, NgIf, TitleCasePipe} from '@angular/common';
import {TableCard} from '../home/table-card/table-card.interface';
import {AuthService} from '../auth/auth.service';
import {ThemeMode, ThemeService} from '../theme.service';

@Component({
  selector: 'tbl-navbar',
  standalone: true,
  imports: [
    FormsModule,
    NgIf,
    NgClass,
    TitleCasePipe
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {

  protected searchContent: string = '';
  protected searchFieldOnFocus: boolean = false;
  @ViewChild('searchField') private searchField!: ElementRef;
  private timer: any;
  @Output() onSearchedTableCard: EventEmitter<TableCard[]> = new EventEmitter;
  protected userInfo: UserInfo = {
    name: '',
    surname: '',
    email: ''
  }


  constructor(private navbarService: NavbarService,
              private authService: AuthService,
              protected themeService: ThemeService) {}


  ngOnInit(): void {
    const email: string | undefined = this.authService.authentication?.email
    if (!email) return;

    this.navbarService.retrievesUserInformation(email).subscribe({
      next: (data: UserInfo): void => {
        this.userInfo = data;
      },
      error: err => console.error(err)
    })
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

  protected onKeyUp(event: KeyboardEvent): void {
    if (event.key === 'Enter') return;

    clearTimeout(this.timer);
    this.timer = setTimeout((): void => {
      this.search(this.searchContent);
    }, 500);
  }

  public search(text: string): void {
    this.navbarService.fuzzySearch(text).subscribe({
      next: (tableCards: TableCard[]): void => {
        console.debug(tableCards);
        this.onSearchedTableCard.emit(tableCards);
      },
      error: (err: any): any => console.debug(err)
    });
  }

  onSingOut(): void {
    this.authService.signOut();
  }

  setTheme(theme: ThemeMode): void {
    this.themeService.setTheme(theme);
  }
}
