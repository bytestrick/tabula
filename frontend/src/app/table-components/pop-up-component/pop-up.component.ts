import {
  AfterViewInit, ChangeDetectorRef,
  Component, ComponentRef,
  ElementRef,
  EventEmitter, OnDestroy, OnInit,
  Output,
  Renderer2,
  ViewChild, ViewContainerRef
} from '@angular/core';
import {Pair} from '../../model/pair';
import {IPopUpContent} from '../../model/i-pop-up-content';

@Component({
  selector: 'tbl-pop-up',
  standalone: true,
  imports: [],
  templateUrl: './pop-up.component.html',
  styleUrl: './pop-up.component.css',
})
export class PopUp implements OnInit, OnDestroy, AfterViewInit {

  @ViewChild('popUpContainer', { static: true }) private popUpContainer!: ElementRef;
  @ViewChild('contentContainer', { read: ViewContainerRef, static: true }) private contentContainer!: ViewContainerRef;
  @ViewChild('root', { static: true }) private root!: ElementRef;

  @Output() hidden: EventEmitter<void> = new EventEmitter<void>();
  @Output() shown: EventEmitter<void> = new EventEmitter<void>();

  protected isVisible: boolean = false;
  private content: ComponentRef<IPopUpContent> | null = null;
  private visibilityObserver!: MutationObserver;

  private isInitialized: boolean = false;
  private pendingCall: (() => void)[] = [];
  private popUpPosition: Pair<number, number> = new Pair(0, 0);
  private readonly OFFSET_TO_SCREEN_SIDES: number = 6;

  readonly CLOSED_WITH_LEFT_CLICK: string = 'leftClick';
  readonly CLOSED_WITH_RIGHT_CLICK: string = 'rightClick';


  constructor(private renderer: Renderer2, private changeDetector: ChangeDetectorRef) {}


  ngOnInit(): void {
    this.visibilityObserver = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.attributeName === 'hidden') {
          const currentlyHidden: boolean = this.root.nativeElement.hidden;

          if (!currentlyHidden) {
            this.content?.instance.beforeContentShowUp();
            this.updatePositionToFitScreen(); // Chiamata qui perché il content deve essere inserito prima di poter calcolare la posizione adatta.
            this.shown.emit();
          }
          else
            this.hidden.emit();
        }
      });
    });

    this.visibilityObserver.observe(this.root.nativeElement, {
      attributes: true,
      attributeFilter: ['hidden']
    });
  }


  ngAfterViewInit(): void {
    this.isInitialized = true;
    this.pendingCall.forEach(callback => callback());
  }


  ngOnDestroy(): void {
    this.visibilityObserver.disconnect();
  }


  setPopUpPosition(position: Pair<number, number>): void {
    this.popUpPosition = position;

    this.renderer.setStyle(
      this.popUpContainer.nativeElement,
      'transform',
      `translate(${position.first}px, ${position.second}px)`
    );
  }


  private updatePositionToFitScreen(): void {
    const viewportWidth: number = window.innerWidth;
    const viewportHeight: number = window.innerHeight;
    const popUpWidth: number = this.popUpContainer.nativeElement.offsetWidth + this.OFFSET_TO_SCREEN_SIDES;
    const popUpHeight: number = this.popUpContainer.nativeElement.offsetHeight + this.OFFSET_TO_SCREEN_SIDES;
    const offScreenAmountX: number = (this.popUpPosition.first + popUpWidth) - viewportWidth;
    const offScreenAmountY: number = (this.popUpPosition.second + popUpHeight) - viewportHeight;

    if (offScreenAmountX > 0)
      this.popUpPosition.first -= offScreenAmountX;

    if (offScreenAmountY > 0)
      this.popUpPosition.second -= offScreenAmountY;

    this.renderer.setStyle(
      this.popUpContainer.nativeElement,
      'transform',
      `translate(${this.popUpPosition.first}px, ${this.popUpPosition.second}px)`
    );
  }


  setContent(content: ComponentRef<IPopUpContent>): void {
    this.contentContainer.clear();
    content.instance.popUpRef = this;
    this.contentContainer.insert(content.hostView);
    this.content = content;
  }


  getContent(): ComponentRef<IPopUpContent> | null {
    return this.content;
  }


  private callAfterInit(callback: () => void): void {
    if (this.isInitialized)
      callback();
    else
      this.pendingCall.push(callback);
  }


  show(position: Pair<number, number>): void {
    this.callAfterInit(
      (): void => {
        this.setPopUpPosition(position); // deve essere chiamata dopo che il content viene inserito
        this.isVisible = true;
        this.changeDetector.detectChanges();
      }
    );
  }


  hasContent(content: ComponentRef<IPopUpContent> | null): boolean {
    if (this.content === null || content === null)
      return false;

    return this.content.instance instanceof (content.instance.constructor);
  }


  hide(): void {
    this.isVisible = false;
  }


  onHidePopUp(action: string): void {
    this.content?.instance.onHidden(action);
    this.hide();
  }
}
