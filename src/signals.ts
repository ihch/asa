export class Signal<T> {
  private _state;
  private _subscribers: (() => void)[] = [];

  constructor(initialValue: T) {
    this._state = initialValue;
  }

  get state(): T {
    return this._state;
  }

  private isSetterFunction(f: unknown): f is (newValue: T) => T {
    return typeof f === "function";
  }

  setState(newValue: T | ((currentValue: T) => T)): void {
    let _newValue;

    if (this.isSetterFunction(newValue)) {
      _newValue = newValue(this.state);
    } else {
      _newValue = newValue;
    }

    if (this.state === _newValue) return;

    this._state = _newValue;
    this._subscribers.forEach((subscriber) => {
      subscriber();
    });
  }

  subscribe(subscriber: () => void): void {
    this._subscribers.push(subscriber);
  }
}

export function createSignal<T>(initialValue: T): Signal<T> {
  return new Signal(initialValue);
}

// deno-lint-ignore no-explicit-any
export function createEffect(effect: () => void, dependencies: Signal<any>[]) {
  dependencies.forEach((signal) => {
    signal.subscribe(effect);
  });
}

// deno-lint-ignore no-explicit-any
export function createMemo<T>(memo: () => T, dependencies: Signal<any>[]): Signal<T> {
  const signal = createSignal(memo());

  dependencies.forEach((depSignal) => {
    depSignal.subscribe(() => {
      signal.setState(memo);
    });
  });

  return signal;
}

// Playground
if (import.meta.main) {
  const count = createSignal(0);
  const countPlus100 = createMemo(() => count.state + 100, [count]);

  createEffect(() => {
    console.log(count.state);
    console.log(countPlus100.state);
    console.log("wowwow");
  }, [count]);

  setInterval(() => {
    if (count.state >= 10) Deno.exit();
    count.setState((currentValue) => currentValue + 1);
  }, 1000);
}
