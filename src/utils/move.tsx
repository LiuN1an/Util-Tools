import React, { useEffect, useMemo, useRef, useState } from "react";

let isDragFeedBack = false;
let isMove = false;
let start = null;

export const MoveAlignRightBtn = () => {
  const [distance, setDistance] = useState(100);
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      const dom = ref.current;
      const handlePointerDown = (e: PointerEvent) => {
        isDragFeedBack = true;
        const rect = dom.getBoundingClientRect();
        start = {
          x: rect.x,
          y: rect.y,
        };
      };
      const handlePointerUp = (e: PointerEvent) => {
        let event = e as unknown as React.PointerEvent<HTMLDivElement>;
        if (isDragFeedBack && isMove) {
          setDistance(-event.pageY + start.y + distance);
          start = null;
          setX(0);
          setY(0);
        }
        isDragFeedBack = false;
        isMove = false;
      };
      const handlePointerMove = (e: PointerEvent) => {
        let event = e as unknown as React.PointerEvent<HTMLDivElement>;
        if (isDragFeedBack && start) {
          isMove = true;
          setX(event.pageX - start.x);
          setY(event.pageY - start.y);
        }
      };
      dom.addEventListener("pointerdown", handlePointerDown);
      document.body.addEventListener("pointerup", handlePointerUp);
      document.body.addEventListener("pointermove", handlePointerMove);
      return () => {
        dom.removeEventListener("pointerdown", handlePointerDown);
        document.body.removeEventListener("pointerup", handlePointerUp);
        document.body.removeEventListener(
          "pointermove",
          handlePointerMove
        );
      };
    }
  }, [ref.current, distance]);

  const transform = useMemo(() => {
    return `translate(${x}px, ${y}px)`;
  }, [x, y]);

  return (
    <div
      className="fixed right-0 rounded-full cursor-pointer h-12 flex justify-end items-center"
      style={{ bottom: distance + "px", transform }}
      onClick={async () => {
        // do something
      }}
      ref={ref}
    >
      {/* content */}
    </div>
  );
};
