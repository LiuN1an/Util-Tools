import React, {
  ReactNode,
  useLayoutEffect,
  useState,
  useCallback,
} from "react";

export type ResponsiveGridProps = {
  container: React.MutableRefObject<HTMLDivElement>;
  items: ReactNode[];
  width: number;
  height: number;
  gap?: number; // 最小 gap 大小
  gapY?: number;
  mode?: "horizontal"; // 暂时只支持横向模式
};

export function ResponsiveGrid<T>(props: ResponsiveGridProps) {
  const { container, items, width, height, gap = 16, gapY = 16 } = props;
  const [spaceBetween, setSpaceBetween] = useState(0);
  const [colCount, setColCount] = useState(0);
  const [computedHeight, computeHeight] = useState(0);
  const [dynamicGap, setGap] = useState(gap);

  useLayoutEffect(() => {
    if (container.current) {
      const observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const outWidth =
            entry.devicePixelContentBoxSize?.[0]?.inlineSize;
          if (outWidth) {
            const rest = outWidth / (width + gap);
            if (rest > 1) {
              const count = Math.floor(rest);
              const remainder = (rest - count) * (width + gap) + gap;
              const spaceBetween = remainder / 2;

              const rowCount = Math.ceil(items.length / count);
              computeHeight(rowCount * height + (rowCount - 1) * gapY);
              setSpaceBetween(spaceBetween);
              setColCount(count);
              const dynamicGap =
                (gap * (count - 1) + remainder) / (count - 1);
              setGap(dynamicGap);
            }
          }
        }
      });
      observer.observe(container.current);
      return () => {
        container.current && observer.unobserve(container.current);
      };
    }
  }, [container.current, width, height, gap, gapY, items.length]);

  const postionX = useCallback(
    (index: number): number | undefined => {
      const whichCol = index % colCount;
      return whichCol * width + whichCol * dynamicGap;
    },
    [width, gap, colCount, dynamicGap]
  );

  const postionY = useCallback(
    (index: number): number | undefined => {
      const whichRow = Math.floor(index / colCount);
      return whichRow * height + whichRow * gapY;
    },
    [height, gapY, colCount]
  );

  return (
    <div className="relative w-full">
      <div
        style={{ height: `${computedHeight}px` }}
        className="w-full transition-all duration-50"
      />
      {items.map((item, index) => {
        return (
          <div
            key={index}
            className="absolute top-0 left-0 transition-all duration-150"
            style={{
              transform: `translate(${postionX(index) || 0}px, ${
                postionY(index) || 0
              }px)`,
            }}
          >
            {item}
          </div>
        );
      })}
    </div>
  );
}
