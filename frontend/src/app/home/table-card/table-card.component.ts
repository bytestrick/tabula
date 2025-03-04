import {Component, ComponentRef, ElementRef, ViewChild, ViewContainerRef} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-table-card',
  standalone: true,
  imports: [
    FormsModule,
    NgIf,
  ],
  templateUrl: './table-card.component.html',
  styleUrl: './table-card.component.css'
})
export class TableCardComponent {
  protected title: String = '';
  protected description: String = '';
  protected formTitle: String = '';
  protected formDescription: String = '';
  protected inEditMode: boolean = false;
  private ref!: ComponentRef<TableCardComponent>;

  @ViewChild('editTableCardForm') private form!: ElementRef<HTMLFormElement>;

  public static create(containerRef: ViewContainerRef): ComponentRef<TableCardComponent> {
    let newTableCard: ComponentRef<TableCardComponent> = containerRef.createComponent(TableCardComponent);
    newTableCard.instance.ref = newTableCard;
    return newTableCard;
  }

  public edit(): void {
    this.formTitle = this.title;
    this.formDescription = this.description;
    this.inEditMode = true;
  }

  public cancelEdit(): void {
    this.inEditMode = false;
    this.form.nativeElement.classList.remove('was-validated');
  }

  public confirmEdit(): void {
    if (!this.form) {
      return;
    }

    if (this.form.nativeElement.checkValidity()) {
      this.title = this.formTitle;
      this.description = this.formDescription;
      this.inEditMode = false;
      this.form.nativeElement.classList.remove('was-validated');
    }
    else {
      this.form.nativeElement.classList.add('was-validated');
    }
  }

  public setTitle(title: String): void {
    this.title = title;
  }

  public setDescription(description: String): void {
    this.description = description;
  }

  public delete(): void {
    this.ref.destroy();
  }
}
