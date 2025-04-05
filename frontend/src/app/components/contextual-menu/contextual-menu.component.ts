import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  Renderer2,
  ViewChild
} from '@angular/core';
import {IPopUpContent} from '../../model/i-pop-up-content';
import {PopUp} from '../pop-up-component/pop-up.component';
import {Pair} from '../../model/pair';

@Component({
  selector: 'app-contextual-menu',
  standalone: true,
  templateUrl: './contextual-menu.component.html',
  styleUrl: './contextual-menu.component.css'
})
export class ContextualMenuComponent implements IPopUpContent, AfterViewInit {

  @ViewChild('defaultActionTarget', { static: true }) defaultActionTarget!: ElementRef;

  @Input() cellCord: Pair<number | null, number | null> = new Pair(null, null);

  @Input() doOnDelete: ((cellCord: Pair<number | null, number | null>, actionTarget: string) => void) | undefined;
  @Input() doOnDuplicate: ((cellCord: Pair<number | null, number | null>, actionTarget: string) => void) | undefined;

  popUpRef?: PopUp | undefined;

  readonly TARGET_ROW: string = 'row';
  readonly TARGET_COLUMN: string = 'column';

  protected currentActionTarget: string = this.TARGET_ROW;


  constructor(private renderer: Renderer2) {}


  onHidden(_action: string): void {}


  ngAfterViewInit(): void {
    this.renderer.setAttribute(this.defaultActionTarget.nativeElement,'checked', '');
  }


  beforeContentShowUp(): void {}


  onDelete(): void {
    this.popUpRef?.hide();
    this.doOnDelete?.(this.cellCord, this.currentActionTarget);
  }


  onDuplicate(): void {
    this.popUpRef?.hide();
    this.doOnDuplicate?.(this.cellCord, this.currentActionTarget);
  }


  onActionTargetChanged(newTarget: string): void {
    this.currentActionTarget = newTarget;
  }
}
