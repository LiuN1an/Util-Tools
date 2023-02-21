import EventEmitter from "events";
import React, { FC, PropsWithChildren, useContext } from "react";

export type Progress = { progress: number; label?: string };

export type ProgressConstructor = { progress?: number; step: string };

export type ProgressOnChangeProps = {
  key: string;
  progress: string;
  items: Progress[];
};

export class ProgressItem {
  private _event = new EventEmitter();

  private _items: Map<string, Progress> = new Map();

  public complete = false;

  constructor(config?: ProgressConstructor[]) {
    if (config && Array.isArray(config)) {
      for (const item of config) {
        this._items.set(item.step, { progress: item.progress || 0 });
      }
    }
  }
  public get items() {
    return Array.from(this._items.entries()).map((item) => item[1]);
  }

  public setProgress(key: string, progress: number) {
    const item = this._items.get(key);
    if (item) {
      item.progress = progress;
      this._event.emit("onChange", {
        key,
        progress,
        items: Array.from(this._items.values()),
      });
      if (
        Array.from(this._items.entries()).every(
          (item) => item[1].progress >= 100
        )
      ) {
        this.complete = true;
      }
    }
  }

  public onChange(fn: (props: ProgressOnChangeProps) => void) {
    this._event.on("change", fn);
    return () => {
      this._event.off("change", fn);
    };
  }

  public onComplete(fn: () => void) {
    this._event.on("complete", fn);
    return () => {
      this._event.off("complete", fn);
    };
  }
}

export class ProgressContainer {
  private _record: Map<string, ProgressItem> = new Map();

  public createProgress(props: {
    steps: ProgressConstructor | ProgressConstructor[];
    key?: string;
  }) {
    const { steps, key = Math.random().toString().slice(2) } = props;
    if (this.get(key)) return;
    const origin = Array.isArray(steps) ? steps : [steps];
    const item = new ProgressItem(origin);
    item.onComplete(() => {
      this._record.delete(key);
    });
    this._record.set(key, item);
    return { key, item };
  }

  public get(key: string) {
    return this._record.get(key);
  }
}

const progressInstance = new ProgressContainer();

export const ProgressStore = React.createContext<ProgressContainer | null>(
  null
);

export const useProgressStore = () => {
  return useContext(ProgressStore);
};

export const ProgressContainerProvider: FC<PropsWithChildren<{}>> = ({
  children,
}) => {
  return (
    <ProgressStore.Provider value={progressInstance}>
      {children}
    </ProgressStore.Provider>
  );
};
