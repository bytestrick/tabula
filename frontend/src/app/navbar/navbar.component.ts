import {Component, ElementRef, EventEmitter, inject, OnInit, Output, Signal, viewChild} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {NavbarService, UserDetails} from './navbar.service';
import {NgClass, NgIf, TitleCasePipe} from '@angular/common';
import {TableCard} from '../home/table-card/table-card.interface';
import {AuthService} from '../auth/auth.service';
import {ThemeService} from '../theme.service';
import {ConfirmDialogService} from '../confirm-dialog/confirm-dialog.service';
import {DeleteAccountComponent} from './delete-account/delete-account.component';
import {ChangePasswordComponent} from './update-password/change-password.component';
import {UpdateAccountDetailsComponent} from './update-account-details/update-account-details.component';

@Component({
  selector: 'tbl-navbar',
  imports: [FormsModule, NgIf, NgClass, TitleCasePipe, DeleteAccountComponent, ChangePasswordComponent, UpdateAccountDetailsComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {
  private navbarService = inject(NavbarService);
  private authService = inject(AuthService);
  protected themeService = inject(ThemeService);
  private confirmDialog = inject(ConfirmDialogService);

  protected searchContent = '';
  protected searchFieldOnFocus = false;
  private searchField: Signal<ElementRef> = viewChild.required('searchField');
  private timer: any;
  @Output() onSearchedTableCard: EventEmitter<TableCard[] | "noSearchContent"> = new EventEmitter;
  protected _userDetails: UserDetails = {name: '', surname: '', email: ''};
  private static searching = false;

  ngOnInit() {
    this.navbarService.retrievesUserInformation(this.authService.authentication!.email).subscribe({
      next: (data: UserDetails) => this._userDetails = data,
      error: err => console.error(err)
    })
  }

  protected set userDetails(details: UserDetails) {
    this._userDetails = details;
  }

  protected onSearchSubmit(_: HTMLFormElement) {
    this.search(this.searchContent);
  }

  protected clearSearch() {
    this.searchContent = '';
    this.searchField().nativeElement.focus();
  }

  protected onFocus() {
    this.searchFieldOnFocus = true;
  }

  protected onFocusOut($event: FocusEvent) {
    const relatedTarget = $event.relatedTarget as HTMLElement | null;
    if (relatedTarget && relatedTarget.id === 'clear-search-field-button') {
      return;
    }
    this.searchFieldOnFocus = false;
  }

  protected onKeyUp(event: KeyboardEvent) {
    if (event.key === 'Enter') return;

    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.search(this.searchContent);
    }, 500);
  }

  static isSearching(): boolean {
    return NavbarComponent.searching;
  }

  protected onSingOut() {
    this.confirmDialog.show({
      title: 'Sign out of your account?',
      description: 'Are you sure?'
    }).subscribe((response: boolean) => {
      if (response) {
        this.authService.signOut();
      }
    });
  }

  search(text: string) {
    if (text === "") {
      NavbarComponent.searching = false;
      this.onSearchedTableCard.emit("noSearchContent");
      return;
    }

    NavbarComponent.searching = true;
    this.navbarService.fuzzySearch(text).subscribe({
      next: (tableCards: TableCard[]): void => {
        console.debug(tableCards);
        this.onSearchedTableCard.emit(tableCards);
      },
      error: (err: any): any => console.debug(err)
    });
  }
}
