import { Injectable, OnDestroy } from '@angular/core';

declare const lucide: any;

@Injectable({ providedIn: 'root' })
export class LucideService implements OnDestroy {
  private observer: MutationObserver | null = null;

  init(): void {
    this.refresh();

    this.observer = new MutationObserver((mutations) => {
      let hasNewIcons = false;
      for (const mutation of mutations) {
        if (mutation.type === 'childList') {
          for (const node of Array.from(mutation.addedNodes)) {
            if (node.nodeType === 1) {
              const el = node as HTMLElement;
              if (el.matches?.('[data-lucide]') || el.querySelector?.('[data-lucide]')) {
                hasNewIcons = true;
                break;
              }
            }
          }
        }
        if (hasNewIcons) break;
      }
      if (hasNewIcons) {
        this.refresh();
      }
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  refresh(): void {
    try {
      lucide.createIcons();
    } catch {}
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    this.observer = null;
  }
}
