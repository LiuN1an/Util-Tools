import {
  ComponentType,
  ReactElement,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { Observer } from "../utils/observer";
import { Spinner } from "@chakra-ui/react";
import React from "react";
import classnames from "classnames";

if (typeof window === "undefined") {
  React.useLayoutEffect = React.useEffect;
}

export type ArrayElementCommon = { id: string };

function create2DEmptyArray(rows: number) {
  const array = new Array(rows);
  for (let i = 0; i < rows; i++) {
    array[i] = [];
  }
  return array;
}

function patchLists<T>(value: T[], divide: number) {
  const lists: T[][] = create2DEmptyArray(divide);
  for (let index = 0; index < value.length; index++) {
    const box = index % divide;
    lists[box].push(value[index]);
  }
  return lists;
}

interface WaterFallProps<T> {
  value: Array<T>;
  render: ComponentType<T>;
  loadMore?: () => Promise<void>;
  refresh?: () => void;
}

function App<T extends ArrayElementCommon & unknown>({
  value,
  render: Render,
  loadMore,
  refresh,
}: WaterFallProps<T>): ReactElement {
  const [list, setList] = useState<T[][]>([]);
  const [loading, setLoading] = useState(false);
  const containRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const dom = containRef.current;
    if (dom) {
      const resize = (width: number) => {
        const unit = calculateUnit(width);
        setList(patchLists(value, unit));
      };

      resize(dom.getBoundingClientRect().width);

      const observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const { width } = entry.contentRect;
          resize(width);
        }
      });
      observer.observe(dom);

      return () => {
        observer.unobserve(dom);
      };
    }
  }, [containRef, value]);

  return (
    <div
      ref={containRef}
      className={classnames(
        "w-full flex-1",
        value.length === 0 && "h-full"
      )}
    >
      <div className="flex flex-row md:gap-2 relative">
        {list.map((items, i) => {
          return (
            <div
              className="maxd:ml-2 flex-1 flex flex-col md:gap-2"
              key={`${items[0]?.id}-${i}`}
            >
              {items.map((item) => {
                return (
                  <div key={item.id} className="maxd:mt-2">
                    <Render {...item} />
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
      {loading || value.length === 0 ? (
        <div
          className={classnames(
            "w-full flex justify-center items-center p-4",
            value.length === 0 && "h-full"
          )}
        >
          {loading && <Spinner size={"xl"} color="red.500" />}
          {value.length === 0 && <span>暂无结果</span>}
        </div>
      ) : (
        <Observer
          whenTrigger={async () => {
            setLoading(true);
            await new Promise((res) => setTimeout(res, 3000));
            await loadMore?.();
            setLoading(false);
          }}
        />
      )}
    </div>
  );
}

const calculateUnit = (width: number): number => {
  return Math.floor(width / 300) || 1;
};

export default App;
