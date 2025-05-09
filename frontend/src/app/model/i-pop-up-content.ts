import {PopUp} from '../table-components/pop-up-component/pop-up.component';

export interface IPopUpContent {
  popUpRef?: PopUp;

  beforeContentShowUp(): void;
  onHidden(action: string): void;
}
