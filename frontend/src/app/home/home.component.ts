import {Component, ComponentRef, ElementRef, ViewChild, ViewContainerRef} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {TableCardComponent} from './table-card/table-card.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    FormsModule
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  protected title: String = '';
  protected description: String = '';

  @ViewChild('tableCardContainer', { read: ViewContainerRef }) private tableCardContainerRef!: ViewContainerRef;
  @ViewChild('createTableCardForm') private form!: ElementRef<HTMLFormElement>;

  protected createTableCard(): void {
    if (!this.form) {
      return;
    }

    if (this.form.nativeElement.checkValidity()) {
      if (!this.tableCardContainerRef) {
        console.error("tableCardContainer è undefined, impossibile creare il componente.");
        return;
      }
      let newTableCard: ComponentRef<TableCardComponent> = this.tableCardContainerRef.createComponent(TableCardComponent);
      newTableCard.instance.setTitle(this.title);
      newTableCard.instance.setDescription(this.description);

      this.title = '';
      this.description = '';
      this.form.nativeElement.classList.remove('was-validated');
    }
    else {
      this.form.nativeElement.classList.add('was-validated');
    }
  }

  protected cancelCreateTableCard(): void {
    this.title = '';
    this.description = '';
    this.form.nativeElement.classList.remove('was-validated');
  }
}
