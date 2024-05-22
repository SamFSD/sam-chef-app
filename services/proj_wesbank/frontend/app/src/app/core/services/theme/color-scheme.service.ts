import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ColorSchemeService {
  public layoutColorScheme$: BehaviorSubject<any> = new BehaviorSubject(null);

  private renderer: Renderer2;
  private colorScheme: string = 'light'; // Always use light color scheme
  // Define prefix for clearer and more readable class names in scss files
  private colorSchemePrefix = 'color-scheme-';

  constructor(rendererFactory: RendererFactory2) {
    // Create new renderer from renderFactory, to make it possible to use renderer2 in a service
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  load() {
    this.renderer.addClass(document.body, this.colorSchemePrefix + this.colorScheme);
  }

  currentActive() {
    return this.colorScheme;
  }

}
