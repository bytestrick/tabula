import {ComponentRef, createComponent, EnvironmentInjector, Injectable, ViewContainerRef} from '@angular/core';
import {PopUp} from '../components/pop-up-component/pop-up.component';
import {IPopUpContent} from '../model/i-pop-up-content';

@Injectable({
  providedIn: 'root'
})
export class PopUpManagerService {

  private popUpContainer!: ViewContainerRef;
  private popUps: Map<string, ComponentRef<PopUp>> = new Map<string, ComponentRef<PopUp>>();
  private popUpsShown: Set<string> = new Set<string>();


  constructor(private envInj: EnvironmentInjector) { }


  setPopUpContainer(container: ViewContainerRef): void {
    this.popUpContainer = container;
  }


  createPopUp(popUpName: string, content: ComponentRef<IPopUpContent>): ComponentRef<PopUp> {
    if (this.popUps.has(popUpName))
      throw new Error(`pop-up "${popUpName}" already exists.`);

    const popUp: ComponentRef<PopUp> = createComponent<PopUp>(PopUp, { environmentInjector: this.envInj });
    this.popUps.set(popUpName, popUp);
    this.popUpContainer.insert(popUp.hostView);

    popUp.instance.hidden.subscribe((): void => this.onPopUpHidden(popUpName));
    popUp.instance.shown.subscribe((): void => this.onPopUpShown(popUpName));
    popUp.instance.setContent(content);

    return popUp;
  }


  getPopUp(popUpName: string): ComponentRef<PopUp> | undefined {
    return this.popUps.get(popUpName);
  }


  getOrCreatePopUp(popUpName: string, content: ComponentRef<IPopUpContent>): ComponentRef<PopUp> | undefined {
    if (this.popUps.has(popUpName)) {
      const popUp: ComponentRef<PopUp> | undefined = this.getPopUp(popUpName);

      if (!popUp?.instance.hasContent(content))
        popUp?.instance.setContent(content);

      return popUp;
    }

    return this.createPopUp(popUpName, content);
  }


  deletePopUp(popUpName: string): void {
    const popUp: ComponentRef<PopUp> | undefined = this.getPopUp(popUpName);

    if (popUp !== undefined) {
      popUp.instance.hidden.unsubscribe();
      popUp.instance.shown.unsubscribe();
      this.popUps.delete(popUpName);
      popUp.destroy();

      if (this.popUpsShown.has(popUpName))
        this.popUpsShown.delete(popUpName);
    }
  }


  private onPopUpShown(popUpName: string): void {
    this.popUpsShown.add(popUpName);
  }


  private onPopUpHidden(popUpName: string): void {
    this.popUpsShown.delete(popUpName);
  }


  isAnyPopUpShown(): boolean {
    return this.popUpsShown.size >= 1;
  }


  isPopUpShown(popUpName: string): boolean {
    return this.popUpsShown.has(popUpName);
  }
}
