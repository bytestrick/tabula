import {InjectionToken} from '@angular/core';
import { BaseInputComponent } from './base-input-component';

/**
 * Injection token used to provide configuration data to dynamically created input components.
 */
export const INPUT_COMPONENT_CONFIG = new InjectionToken<InputComponentConfiguration>('INPUT_COMPONENT_CONFIG');


/**
 * Configuration interface for input components.
 *
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
  doAfterInputDataTypeConfirmation?: (value: string, dataTypeId: number) => void;
  doAfterInputConfirmation?: (value: any) => void;
  startingValue?: any;
}
