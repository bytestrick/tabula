import {
  AfterViewInit,
  Component,
  ComponentRef,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  Renderer2,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import {Pair} from '../../model/pair';
import {PopUpContent} from '../../model/pop-up-content';
import {POPUP_CONTENT} from '../../services/pop-up-manager.service';

/**
 * Angular component for displaying a generic pop-up window.
 * Handles dynamic positioning, visibility toggling, and lifecycle callbacks
 * for external content components.
 * Dynamically injects content and ensures cleanup: if the pop-up is destroyed
 * or its content is replaced, any previously inserted content is removed.
 */
@Component({
  selector: 'tbl-pop-up',
  imports: [],
  templateUrl: './pop-up.component.html',
  styleUrl: './pop-up.component.css',
})
export class PopUp implements OnInit, OnDestroy, AfterViewInit {

  /**
   * Container element wrapping the pop-up content.
   * Used for size calculations and CSS transform adjustments.
   */
  @ViewChild('popUpCard') private popUpCard!: ElementRef;
  /**
   * Dynamic view container for inserting the external content component.
   */
  @ViewChild('contentContainer', { read: ViewContainerRef }) private contentContainer!: ViewContainerRef;
  /**
   * Root element of the component, observed for attribute changes.
   */
  @ViewChild('root') private root!: ElementRef;

  private visibilityObserver!: MutationObserver;
  private popUpPosition: Pair<number, number> = new Pair(0, 0);

  private readonly OFFSET_TO_SCREEN_SIDES: number = 6;

  private popUpContent: ComponentRef<PopUpContent> | null = inject(POPUP_CONTENT);
  private renderer: Renderer2 = inject(Renderer2);

  /**
   * Visibility flag bound in the template to show or hide the pop-up.
   */
  protected _isVisible: boolean = false;

  // Type of click that triggered the closure.
  static readonly CLOSED_WITH_LEFT_CLICK: string = 'leftClick';
  static readonly CLOSED_WITH_RIGHT_CLICK: string = 'rightClick';

  // Repeated here because it doesn't let you put static variables in the template
  protected readonly closedWithLeftClick: string = PopUp.CLOSED_WITH_LEFT_CLICK;
  protected readonly closedWithRightClick: string = PopUp.CLOSED_WITH_RIGHT_CLICK;


  // Initialize the mutation observer to detect visibility changes
  ngOnInit(): void {
    this.visibilityObserver = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.attributeName === 'hidden') {
          const currentlyHidden: boolean = this.root.nativeElement.hidden;

          if (!currentlyHidden) {
            this.popUpContent?.instance.onShowUp();
            this.setPopUpPosition(this.popUpPosition);
          }
        }
      });
    });
  }


  // After the view initializes, insert the content component into the container.
  ngAfterViewInit(): void {
    if (this.popUpContent)
      this.changeContent(this.popUpContent);

    // Observe only the 'hidden' attribute on the root element
    this.visibilityObserver.observe(this.root.nativeElement, {
      attributes: true,
      attributeFilter: ['hidden']
    });
  }


  ngOnDestroy(): void {
    this.visibilityObserver.disconnect();

    if (this.popUpContent)
      this.popUpContent.destroy();
  }


  /**
   * Calculate position to ensure it remains within the viewport,
   * accounting for screen edges and configured <code>OFFSET_TO_SCREEN_SIDES</code>.
   * @param position Initial pixel coordinates Pair(x, y).
   * @returns Adjusted pixel coordinates Pair(x, y).
   * @see Pair
   */
  private adjustPositionToFitScreen(position: Pair<number, number>): Pair<number, number> {
    const viewportWidth: number = window.innerWidth;
    const viewportHeight: number = window.innerHeight;
    const popUpWidth: number = this.popUpCard.nativeElement.offsetWidth;
    const popUpHeight: number = this.popUpCard.nativeElement.offsetHeight;

    const minX: number = this.OFFSET_TO_SCREEN_SIDES;
    const maxX: number = viewportWidth - popUpWidth - this.OFFSET_TO_SCREEN_SIDES;
    const minY: number = this.OFFSET_TO_SCREEN_SIDES;
    const maxY: number = viewportHeight - popUpHeight - this.OFFSET_TO_SCREEN_SIDES;

    position.first = Math.min(Math.max(position.first,  minX), maxX);
    position.second = Math.min(Math.max(position.second, minY), maxY);

    return position;
  }


  /**
   * Set the pop-up position and apply the CSS transform.
   * @param position Pixel coordinates Pair(x, y).
   * @see Pair
   */
  setPopUpPosition(position: Pair<number, number>): void {
    position = this.adjustPositionToFitScreen(position);

    this.renderer.setStyle(
      this.popUpCard.nativeElement,
      'transform',
      `translate(${position.first}px, ${position.second}px)`
    );
  }


  /**
   * Show the pop-up at a given position.
   * @param position Pixel coordinates Pair(x, y).
   * @see Pair
   */
  show(position: Pair<number, number>): void {
    this.popUpPosition = position;
    this._isVisible = true;
  }


  /**
   * Public method to hide the pop-up.
   */
  hide(): void {
    this._isVisible = false;
  }


  /**
   * Handle clicks outside the pop-up area: hide the pop-up and notify content.
   * @param action Type of click that triggered the closure:
   *                <ul>
   *                  <li><code>PopUp.CLOSED_WITH_LEFT_CLICK</code></li>
   *                  <li><code>PopUp.CLOSED_WITH_RIGHT_CLICK</code></li>
   *                </ul>
   */
  onOutsidePopUpClick(action: string): void {
    this.hide();
    this.popUpContent?.instance?.onHidden(action);
  }


  /**
   * Replace current injected content with a new component.
   * Ensures previous content is removed before insertion.
   * @param newContent - ComponentRef implementing {@link PopUpContent}
   */
  changeContent<T extends PopUpContent>(newContent: ComponentRef<T>): void {
    this.contentContainer.clear();
    this.contentContainer.insert(newContent.hostView);
    this.popUpContent = newContent;
  }


  /**
   * Visibility flag getter bound in template.
   */
  get isVisible(): boolean {
    return this._isVisible;
  }


  /**
   * Current injected content component reference.
   */
  get content(): ComponentRef<PopUpContent> | null {
    return this.popUpContent;
  }
}
