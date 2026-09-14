import { Injectable, OnDestroy } from '@angular/core';

declare const lucide: any;

@Injectable({ providedIn: 'root' })
export class LucideService implements OnDestroy {
  private observer: MutationObserver | null = null;
  private debounceTimer: any = null;

  init(): void {
    this.runIcons();

    this.observer = new MutationObserver(() => {
      this.scheduleRun();
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  private scheduleRun(): void {
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.runIcons();
    }, 100);
  }

  private runIcons(): void {
    try {
      lucide.createIcons();
    } catch {}
  }

  ngOnDestroy(): void {
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.observer?.disconnect();
    this.observer = null;
  }
}
