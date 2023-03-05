import classNames from "classnames";
import EventEmitter from "events";
import React, {
  FC,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";

export type Progress = { progress: number; label?: string };

export type ProgressConstructor = {
  progress?: number;
  id: string;
  label?: string;
};

export type ProgressOnChangeProps = {
  key: string;
  progress: string;
  items: Progress[];
};

export class ProgressItem {
  private _event = new EventEmitter();

  private _items: Map<string, Progress> = new Map();

  public complete = false;

  constructor(readonly key: string, config?: ProgressConstructor[]) {
    if (config && Array.isArray(config)) {
      for (const item of config) {
        this._items.set(item.id, {
          progress: item.progress || 0,
          label: item.label,
        });
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
      this._event.emit("change", {
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
        this._event.emit("complete");
      }
    }
  }

  public abort() {
    this._event.emit("abort");
  }

  public finish(key: string) {
    this.setProgress(key, 100);
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

  public onAbort(fn: () => void) {
    this._event.on("abort", fn);
    return () => {
      this._event.off("abort", fn);
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
    const item = new ProgressItem(key, origin);
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

export const ProgressView: FC<{
  onClose: () => void;
  progress?: ProgressItem;
  isMobile?: boolean;
}> = ({ onClose, progress, isMobile = false }) => {
  const [items, setItems] = useState<Progress[]>([]);

  useEffect(() => {
    setItems(progress.items || []);
  }, []);

  useEffect(() => {
    const abort = progress?.onAbort(() => {
      setTimeout(() => {
        onClose?.();
      }, 500);
    });
    const change = progress?.onChange(({ key, items }) => {
      console.log({ key });
      setItems(items);
    });
    if (progress?.complete) {
      setItems(progress.items);
      setTimeout(() => {
        onClose?.();
      }, 1000);
    } else {
      const complete = progress?.onComplete(() => {
        setTimeout(() => {
          onClose?.();
        }, 500);
      });
      return () => {
        abort?.();
        change?.();
        complete?.();
      };
    }
    return () => {
      abort?.();
      change?.();
    };
  }, [progress, onClose]);

  return (
    <div
      className={classNames(
        isMobile ? "w-full" : "w-96 rounded-xl",
        "min-h-56 border-[1px] px-2 py-4 box-border flex flex-col justify-around items-start bg-white/80 backdrop-blur gap-2 shadow-xl"
      )}
    >
      <div className="w-full chat chat-end">
        <div className="chat-image avatar">
          <div className="w-10 rounded-full">
            <img src={""} />
          </div>
        </div>
        <div className="chat-bubble">Progress of work</div>
      </div>
      <div className="flex flex-col justify-around items-center flex-1 gap-3 w-full">
        {items.map((item, key) => {
          return (
            <div
              key={key}
              className="w-full flex flex-col gap-2 justify-center items-start"
            >
              <div className="text-ellipsis overflow-hidden flex-1 whitespace-nowrap text-xs">
                {item.label}
              </div>
              <div className="flex justify-center items-center gap-2 w-full">
                <progress
                  className={classNames(
                    "progress flex-1",
                    item.progress == 100
                      ? "progress-success"
                      : "progress-warning"
                  )}
                  value={item.progress}
                  max="100"
                />
                <span className="text-ellipsis overflow-hidden whitespace-nowrap text-slate-600 text-xs">
                  {item.progress}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const progressCounter = (
  progress: ProgressItem | undefined,
  key: string,
  interval = 100
) => {
  console.log({ progress, key });
  if (progress) {
    let _max = 0;
    const counter = setInterval(() => {
      _max += 2;
      progress?.setProgress(key, _max > 99 ? 99 : _max);
    }, interval);
    return () => {
      clearInterval(counter);
    };
  } else {
    return () => {};
  }
};
