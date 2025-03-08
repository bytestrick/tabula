import {Component, ComponentRef, ViewContainerRef} from '@angular/core';
import {HomeMediatorService} from '../../services/home/home-mediator.service';

@Component({
  selector: 'app-table-card',
  standalone: true,
  imports: [],
  templateUrl: './table-card.component.html',
  styleUrl: './table-card.component.css'
})
export class TableCardComponent {
  private ref!: ComponentRef<TableCardComponent>;
  protected title: string = "Title";
  protected description: string = "Description";


  constructor(private homeMediatorService: HomeMediatorService) {}


  public static create(containerRef: ViewContainerRef): TableCardComponent {
    let newTableCard: ComponentRef<TableCardComponent> = containerRef.createComponent(TableCardComponent);
    newTableCard.instance.ref = newTableCard;
    return newTableCard.instance;
  }

  public delete(): void {
    this.ref.destroy();
  }

  public edit(): void {
    this.homeMediatorService.editTableCard(this);
    this.homeMediatorService.showModalEditTableCard();
  }

  public setTitle(title: string): void {
    this.title = title;
  }

  public getTitle(): string {
    return this.title;
  }

  public setDescription(description: string): void {
    this.description = description;
  }

  public getDescription(): string {
    return this.description;
  }
}
