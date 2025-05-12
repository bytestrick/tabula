import {ComponentRef, Injectable, InjectionToken, Injector, ValueProvider, ViewContainerRef} from '@angular/core';
import {PopUp} from '../table-components/pop-up-component/pop-up.component';
import {PopUpContent} from '../model/pop-up-content';


export const POPUP_CONTENT = new InjectionToken<ComponentRef<PopUpContent>>('POPUP_CONTENT');


@Injectable({
  providedIn: 'root'
})
export class PopUpManagerService {

  /**
   * Container reference where pop-ups will be dynamically inserted.
   * Set via <code>setPopUpContainer()</code>.
   */
  private popUpContainer?: ViewContainerRef;


  private getInjector<T extends PopUpContent>(value: ComponentRef<T> | null): Injector {
    const provider: ValueProvider = {
      provide: POPUP_CONTENT,
      useValue: value
    };

    return Injector.create({
      providers: [provider]
    });
  }


  /**
   * Dynamically creates a PopUp component instance and injects the provided content into it.
   * Ensures that a container has been configured before creation.
   *
   * @typeParam T - Type of the content component extending PopUpContent.
   * @param content ComponentRef of the content to display inside the pop-up.
   * @throws Error if no pop-up container has been set via setPopUpContainer().
   * @returns ComponentRef for the newly created PopUp.
   */
  createPopUp<T extends PopUpContent>(content: ComponentRef<T>): ComponentRef<PopUp> {
    if (!this.popUpContainer)
      throw new Error('A pop-up container must be set up before you can call \'createPopUp\'.');

    return this.popUpContainer.createComponent<PopUp>(PopUp, { injector: this.getInjector(content) });
  }


  createPopUpWithoutContent(): ComponentRef<PopUp> {
    if (!this.popUpContainer)
      throw new Error('A pop-up container must be set up before you can call \'createPopUp\'.');

    return this.popUpContainer.createComponent<PopUp>(PopUp, { injector: this.getInjector(null) });
  }


  /**
   * Sets the container where all pop-up components will be injected.
   * Must be called before any createPopUp() invocation.
   *
   * @param container ViewContainerRef to host pop-up components.
   */
  setPopUpContainer(container: ViewContainerRef): void {
    this.popUpContainer = container;
  }
}
