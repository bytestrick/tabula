import {
  ComponentRef,
  createComponent,
  EnvironmentInjector, inject,
  Injectable,
  Injector,
  Type,
  ValueProvider
} from '@angular/core';
import {BaseInputComponent} from '../table-components/input-components/base-input-component';
import {
  INPUT_COMPONENT_CONFIG,
  InputComponentConfiguration
} from '../table-components/input-components/InputComponentConfiguration';

@Injectable({
  providedIn: 'root'
})
export class InputComponentFactoryService {

  private envInj: EnvironmentInjector = inject(EnvironmentInjector);


  /**
   * Dynamically creates an input component of the specified type,
   * injecting the provided configuration via the <code>INPUT_COMPONENT_CONFIG</code> token.
   *
   * @typeParam T - A class extending <code>BaseInputComponent</code>.
   * @param inputComponent The component type to instantiate.
   * @param config Configuration data ({@link InputComponentConfiguration}) to be provided to the new component.
   * @returns A <code>ComponentRef<T></code> representing the newly created, configured component.
   */
  createInputComponent<T extends BaseInputComponent>(inputComponent: Type<T>,
                       config: InputComponentConfiguration): ComponentRef<T> {

    const provider: ValueProvider = {
      provide: INPUT_COMPONENT_CONFIG,
      useValue: config
    };

    const injector: Injector = Injector.create({
      providers: [provider]
    });

    return createComponent<T>(inputComponent, { environmentInjector: this.envInj, elementInjector: injector });
  }
}
