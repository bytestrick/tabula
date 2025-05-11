import {PopUp} from '../pop-up-component/pop-up.component';
import {ComponentRef, InjectionToken} from '@angular/core';

/**
 * Injection token used to provide configuration data to dynamically created input components.
 */
export const INPUT_COMPONENT_CONFIG = new InjectionToken<InputComponentConfiguration>('INPUT_COMPONENT_CONFIG');


/**
 * Configuration interface for input components.
 *
 * @property {ComponentRef<PopUp>} popUpRef
 *   Reference to the PopUp instance that hosts this input component.
 * @property {any} startingValue
 *   Initial value for the input component.
 * @property {function(value: string, dataTypeId: number):void} [doAfterInputDataTypeConfirmation]
 *   Optional callback executed after an input is confirmed via
 *   {@link BaseInputComponent.confirmInputDataType}. Receives the confirmed
 *   value and a data type ID (use constants from
 *   {@link DataTypeRegistryService}).
 * @property {function(value: any):void} [doAfterInputConfirmation]
 *   Optional callback executed after an input is confirmed via
 *   {@link BaseInputComponent.confirmInput}. Receives the confirmed input value.
 */
export interface InputComponentConfiguration {
  popUpRef: ComponentRef<PopUp>
  doAfterInputDataTypeConfirmation?: (value: string, dataTypeId: number) => void;
  doAfterInputConfirmation?: (value: any) => void;
  startingValue?: any;
}
