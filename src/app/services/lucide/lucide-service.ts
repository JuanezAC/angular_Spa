import { Injectable, OnDestroy } from '@angular/core';

declare const lucide: any;

@Injectable({ providedIn: 'root' })
export class LucideService implements OnDestroy {
  private observer: MutationObserver | null = null;
  private refreshing = false;

  init(): void {
    this.refresh();

    this.observer = new MutationObserver(() => {
      if (!this.refreshing) {
        this.refresh();
      }
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  refresh(): void {
    this.refreshing = true;
    this.observer?.disconnect();
    try {
      lucide.createIcons();
    } catch {}
    setTimeout(() => {
      this.refreshing = false;
      this.observer?.observe(document.body, {
        childList: true,
        subtree: true
      });
    }, 50);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    this.observer = null;
  }
}
