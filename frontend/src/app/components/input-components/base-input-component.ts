import {
  Directive,
  Input,
} from '@angular/core';
import {IPopUpContent} from '../../model/i-pop-up-content';
import {PopUp} from '../pop-up-component/pop-up.component';

@Directive()
export abstract class BaseInputComponent implements IPopUpContent {

  @Input() startingValue: any = null;
  @Input() doAfterInputConfirmation?: (value: any) => void;

  popUpRef?: PopUp;


  protected abstract beforeShowUp(): void;
  abstract grabFocus(): void;


  protected confirmInput(value: any): void {
    if (this.doAfterInputConfirmation)
      this.doAfterInputConfirmation(value);

    this.popUpRef?.hide();
  }


  protected abortInput(): void {
    this.popUpRef?.hide();
  }


  beforeContentShowUp(): void {
    this.grabFocus();
    this.beforeShowUp();
  }


  protected abstract onHiddenWithLeftClick(): void;
  protected abstract onHiddenWithRightClick(): void;


  onHidden(action: string): void {
    switch (action) {
      case this.popUpRef?.CLOSED_WITH_RIGHT_CLICK: {
        this.onHiddenWithRightClick();
        break;
      }
      case this.popUpRef?.CLOSED_WITH_LEFT_CLICK: {
        this.onHiddenWithLeftClick()
        break;
      }
    }
  }
}
