import {PopUp} from '../table-components/pop-up-component/pop-up.component';

/**
 * Contract that external content components must implement to be used within the PopUp component.
 * Defines lifecycle callbacks for showing and hiding events.
 */
export interface PopUpContent {
  /**
   * Parent popup reference.
   */
  popUpRef: PopUp | undefined;

  /**
   * Lifecycle callback invoked when the pop-up becomes visible.
   */
  onShowUp(): void;

  /**
   * Lifecycle callback invoked when the pop-up is hidden.
   * @param action - Identifier of the user action that triggered hiding:
   *                  <code>PopUp.CLOSED_WITH_LEFT_CLICK</code> or
   *                  <code>PopUp.CLOSED_WITH_RIGHT_CLICK</code>.
   */
  onHidden(action: string): void;
}
