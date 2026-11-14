import { Directive, ElementRef, inject, output } from '@angular/core';

/** Emits when a click lands outside the host element (closes menus/dropdowns). */
@Directive({
  selector: '[appClickOutside]',
  host: { '(document:click)': 'onDocumentClick($event)' },
})
export class ClickOutsideDirective {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly appClickOutside = output<void>();

  protected onDocumentClick(event: MouseEvent): void {
    const target = event.target as Node | null;
    if (target && target.isConnected && !this.host.nativeElement.contains(target)) {
      this.appClickOutside.emit();
    }
  }
}
