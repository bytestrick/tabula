import {
  AfterViewInit,
  ComponentRef,
  Directive,
  ElementRef,
  EventEmitter,
  Host,
  Input,
  OnInit,
  Output
} from '@angular/core';
import {InfiniteScrollComponent} from './infinite-scroll.component';

@Directive({
  selector: '[intersectionListener]',
  standalone: true
})
export class IntersectionListenerDirective implements OnInit, AfterViewInit {

  @Input() component!: InfiniteScrollComponent<any>;
  observer!: IntersectionObserver;


  constructor(private element: ElementRef) {}


  ngOnInit(): void {
    this.intersectionObserver();
  }

  ngAfterViewInit(): void {
    this.observer.observe(this.element.nativeElement);
  }

  intersectionObserver(): void {
    let options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.5,
    };
    this.observer = new IntersectionObserver(
      (entries: IntersectionObserverEntry[]): void => {
        if (entries[0].isIntersecting) {
          this.component.loadMoreElements();
        }
      },
      options);
  }
}
