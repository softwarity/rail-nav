import { Injectable, signal } from '@angular/core';

/**
 * Shared, within one `rail-nav-container`, by the rail's items and the content: the anchors the
 * items point at, the one whose section is in view, and how to scroll to one. Provided by the
 * container; not part of the public API.
 */
@Injectable()
export class RailnavAnchors {
  /** Ids the items point at (`<rail-nav-item anchor="…">`). */
  readonly ids = signal<ReadonlySet<string>>(new Set());

  /** The anchor whose section is in view, kept by `rail-nav-content`. */
  readonly active = signal<string | null>(null);

  /** Installed by `rail-nav-content`: scrolls to an anchor's section. */
  scrollTo: (id: string) => void = () => undefined;

  register(id: string): void {
    this.ids.update((ids) => new Set(ids).add(id));
  }

  unregister(id: string): void {
    this.ids.update((ids) => {
      const next = new Set(ids);
      next.delete(id);
      return next;
    });
  }
}
