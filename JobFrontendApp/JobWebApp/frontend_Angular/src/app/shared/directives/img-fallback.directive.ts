import { Directive, ElementRef, inject, input } from '@angular/core';

/**
 * Swaps a broken image (e.g. a company without a logo in /public/Icons) for a
 * fallback image. Usage: <img [src]="..." appImgFallback="/anchor.png">
 */
@Directive({
  selector: 'img[appImgFallback]',
  host: { '(error)': 'onError()' },
})
export class ImgFallbackDirective {
  private readonly img = inject<ElementRef<HTMLImageElement>>(ElementRef);
  readonly appImgFallback = input('/anchor.png');

  protected onError(): void {
    const fallback = this.appImgFallback() || '/anchor.png';
    const el = this.img.nativeElement;
    if (!el.src.endsWith(fallback)) el.src = fallback;
  }
}
