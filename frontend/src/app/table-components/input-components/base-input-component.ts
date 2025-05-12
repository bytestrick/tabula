import {ComponentRef, Directive, inject} from '@angular/core';
import {PopUpContent} from '../../model/pop-up-content';
import {PopUp} from '../pop-up-component/pop-up.component';
import {INPUT_COMPONENT_CONFIG, InputComponentConfiguration} from './InputComponentConfiguration';

/**
 * Abstract base directive for input-based pop-up content components.
 * Implements the PopUpContent contract to integrate with the generic PopUp component.
 * Provides common logic for initializing input configurations,
 * confirming or aborting user input, and handling show/hide lifecycle events.
 */
@Directive()
export abstract class BaseInputComponent implements PopUpContent {

  /**
   * Initial input value provided via configuration at creation time.
   */
  protected startingValue: any = null;
  /**
   * Optional callback invoked after user confirms input with a specific data type.
   * Receives the input string and a numeric dataTypeId.
   */
  private readonly doAfterInputDataTypeConfirmation?: (value: string, dataTypeId: number) => void;
  /**
   * Optional callback invoked after user confirms input generically.
   * Receives the input value of any type.
   */
  private readonly doAfterInputConfirmation?: (value: any) => void;

  popUpRef: ComponentRef<PopUp>;

  private inputComponentConfiguration: InputComponentConfiguration = inject(INPUT_COMPONENT_CONFIG);


  /**
   * Initialize fields based on provided {@link InputComponentConfiguration}.
   */
  constructor() {
    this.startingValue = this.inputComponentConfiguration.startingValue;
    this.doAfterInputConfirmation = this.inputComponentConfiguration.doAfterInputConfirmation;
    this.doAfterInputDataTypeConfirmation = this.inputComponentConfiguration.doAfterInputDataTypeConfirmation;
    this.popUpRef = this.inputComponentConfiguration.popUpRef;
  }


  /**
   * Abstract method to be implemented by subclasses to handle pop-up show event.
   * Use this to initialize, focus, or reset input fields when the pop-up appears.
   */
  protected abstract onPopUpShowUp(): void;

  /**
   * Confirm input and invoke generic confirmation callback if provided.
   * Hides the pop-up after executing the callback.
   * @param value - The value entered or selected by the user
   */
  protected confirmInput(value: any): void {
    if (this.doAfterInputConfirmation)
      this.doAfterInputConfirmation(value);

    this.popUpRef.instance.hide();
  }


  /**
   * Confirm input with a specific data type and invoke typed callback if provided.
   * Hides the pop-up after executing the callback.
   * @param value - The string value entered by the user
   * @param dataTypeId - Numeric identifier representing the chosen data type
   */
  protected confirmInputDataType(value: any, dataTypeId: number): void {
    if (this.doAfterInputDataTypeConfirmation)
      this.doAfterInputDataTypeConfirmation(value, dataTypeId);

    this.popUpRef.instance.hide();
  }


  /**
   * Abort input without invoking any callback and hide the pop-up.
   * Use this to handle cancellation scenarios.
   */
  protected abortInput(): void {
    this.popUpRef.instance.hide();
  }


  /**
   * Abstract method to handle cleanup or additional logic when hidden via left click.
   * Subclasses should implement behavior for user-initiated closure.
   */
  protected abstract onPopUpHiddenWithLeftClick(): void;
  /**
   * Abstract method to handle cleanup or additional logic when hidden via right click.
   * Subclasses should implement context-specific behavior on alternate closure.
   */
  protected abstract onPopUpHiddenWithRightClick(): void;


  /**
   * Lifecycle hook called when the pop-up is hidden.
   * Delegates to subclass-specific callbacks based on the closure action.
   * @param action - Identifier of the click type that triggered hiding:
   *                 PopUp.CLOSED_WITH_LEFT_CLICK or PopUp.CLOSED_WITH_RIGHT_CLICK
   */
  onHidden(action: string): void {
    switch (action) {
      case PopUp.CLOSED_WITH_RIGHT_CLICK: {
        this.onPopUpHiddenWithRightClick();
        break;
      }
      case PopUp.CLOSED_WITH_LEFT_CLICK: {
        this.onPopUpHiddenWithLeftClick()
        break;
      }
    }
  }


  /**
   * Lifecycle hook called when the pop-up becomes visible.
   * Delegates to onPopUpShowUp for subclass-specific initialization logic.
   */
  onShowUp(): void {
    this.onPopUpShowUp();
  }
}

