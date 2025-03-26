import {Component, ComponentRef, ViewContainerRef} from '@angular/core';
import {HomeMediatorService} from '../home-mediator.service';
import {HomeService} from '../home.service';


@Component({
  selector: 'app-table-card',
  standalone: true,
  imports: [],
  templateUrl: './table-card.component.html',
  styleUrl: './table-card.component.css'
})
export class TableCardComponent {
  private ref!: ComponentRef<TableCardComponent>;
  private id: string | null = null;
  protected title: string = "Title";
  protected description: string = "Description";


  constructor(private homeMediatorService: HomeMediatorService, private homeService: HomeService) {}


  public static create(id: string, containerRef: ViewContainerRef): TableCardComponent {
    let newTableCard: ComponentRef<TableCardComponent> = containerRef.createComponent(TableCardComponent);
    newTableCard.instance.id = id;
    newTableCard.instance.ref = newTableCard;
    return newTableCard.instance;
  }

  public onDelete(): void {
    if (this.id) {
      this.homeService.deleteTableCard(this.id).subscribe({
        next: (data: string): void => console.log(data),
        error: (err: any): void => console.log(err)
      });
      this.ref.destroy();
    }
  }

  public onEdit(): void {
    this.homeMediatorService.setTableCardToEdit(this);
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

  public getId(): string | null {
    return this.id;
  }
}
