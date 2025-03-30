import {
  Component, ComponentRef,
  ElementRef,
  EventEmitter,
  Output,
  Renderer2,
  ViewChild, ViewContainerRef
} from '@angular/core';
import {Pair} from '../../model/pair';
import {IPopUpContent} from '../../model/i-pop-up-content';

@Component({
  selector: 'app-pop-up',
  standalone: true,
  imports: [],
  templateUrl: './pop-up.component.html',
  styleUrl: './pop-up.component.css',
})
export class PopUp {

  @ViewChild('popUpContainer') popUpContainer!: ElementRef;
  @ViewChild('contentContainer', { read: ViewContainerRef }) contentContainer!: ViewContainerRef;

  @Output() hidden: EventEmitter<void> = new EventEmitter<void>();
  @Output() shown: EventEmitter<void> = new EventEmitter<void>();

  protected isVisible: boolean = false


  constructor(private renderer: Renderer2) {}


  setPopUpPosition(position: Pair<number, number>): void {
    const viewportWidth: number = window.innerWidth;
    const viewportHeight: number = window.innerHeight;
    const popUpWidth: number = this.popUpContainer.nativeElement.offsetWidth;
    const popUpHeight: number = this.popUpContainer.nativeElement.offsetHeight;
    const offScreenAmountX: number = (position.first + popUpWidth) - viewportWidth;
    const offScreenAmountY: number = (position.second + popUpHeight) - viewportHeight;

    if (offScreenAmountX > 0)
      position.first -= offScreenAmountX;

    if (offScreenAmountY > 0)
      position.second -= offScreenAmountY;

    this.renderer.setStyle(
      this.popUpContainer.nativeElement,
      'transform',
      `translate(${position.first}px, ${position.second}px)`
    );
  }


  private addContent(content: ComponentRef<IPopUpContent>): void {
    this.contentContainer?.clear();
    content.instance.popUpRef = this;
    this.contentContainer?.insert(content.hostView);
  }


  show(content: ComponentRef<IPopUpContent>, position: Pair<number, number>): void {
    this.addContent(content);
    this.setPopUpPosition(position);
    this.isVisible = true;
    this.shown.emit();
  }


  hide(): void {
    this.isVisible = false;
    this.hidden.emit();
  }


  onHidePopUp(): void {
    this.hide();
  }
}
