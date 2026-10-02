// Snapshot history: each entry is a serialized document. Simple and covers every operation
// without writing an inverse per command. Continuous interactions share a coalescing key
// so a drag or a slider produces one undo step.

export interface HistoryOptions {
  maxEntries?: number;
  maxBytes?: number;
}

export class History {
  private past: string[] = [];
  private future: string[] = [];
  private present: string;
  private lastKey: string | null = null;
  private readonly maxEntries: number;
  private readonly maxBytes: number;

  constructor(initial: string, { maxEntries = 100, maxBytes = 20 * 1024 * 1024 }: HistoryOptions = {}) {
    this.present = initial;
    this.maxEntries = maxEntries;
    this.maxBytes = maxBytes;
  }

  get current(): string {
    return this.present;
  }

  get canUndo(): boolean {
    return this.past.length > 0;
  }

  get canRedo(): boolean {
    return this.future.length > 0;
  }

  /**
   * Records a new state. With the same non-null `coalesceKey` as the previous push, the
   * previous step is replaced instead of adding a new one. An unchanged state is ignored.
   */
  push(state: string, coalesceKey: string | null = null): void {
    if (state === this.present) return;
    const coalesce = coalesceKey !== null && coalesceKey === this.lastKey && this.past.length > 0;
    if (!coalesce) this.past.push(this.present);
    this.present = state;
    this.future = [];
    this.lastKey = coalesceKey;
    this.trim();
  }

  undo(): string | null {
    const prev = this.past.pop();
    if (prev === undefined) return null;
    this.future.push(this.present);
    this.present = prev;
    this.lastKey = null;
    return prev;
  }

  redo(): string | null {
    const next = this.future.pop();
    if (next === undefined) return null;
    this.past.push(this.present);
    this.present = next;
    this.lastKey = null;
    return next;
  }

  /** Starts over from `state` with an empty history (new or opened project). */
  reset(state: string): void {
    this.past = [];
    this.future = [];
    this.present = state;
    this.lastKey = null;
  }

  /** Ends the current coalescing run, so the next push starts a new step. */
  seal(): void {
    this.lastKey = null;
  }

  private trim(): void {
    while (this.past.length > this.maxEntries) this.past.shift();
    // Strings are UTF-16: two bytes per code unit.
    let bytes = (this.present.length + this.past.reduce((n, s) => n + s.length, 0)) * 2;
    while (bytes > this.maxBytes && this.past.length > 0) bytes -= (this.past.shift() as string).length * 2;
  }
}
