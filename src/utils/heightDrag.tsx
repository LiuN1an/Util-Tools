import React, { useRef, useState, useEffect } from "react";

/**
 * 对高度进行拖拽
 */
export const useHeightDrag = (props: {
  ref: React.RefObject<HTMLElement>;
  min: number;
}) => {
  const { ref, min } = props;
  const lastHeightRef = useRef(null);
  const [height, setHeight] = useState(min);

  useEffect(() => {
    const dom = ref.current;
    if (dom) {
      let pointId = null;
      let hasDown = false;
      let startY = null;
      let initHeight: number | undefined;
      let currentHeight: number | null = null;

      const handlePointerDown = (e) => {
        const event = e as React.PointerEvent<HTMLElement>;
        pointId = event.pointerId;
        hasDown = true;
        dom.setPointerCapture(pointId);
        startY = event.pageY;
        initHeight = lastHeightRef.current;
        currentHeight = initHeight;
      };
      const handlePointerMove = (e) => {
        if (hasDown) {
          const event = e as React.PointerEvent<HTMLElement>;
          const abs = startY - event.pageY + initHeight;
          const _h = abs < min ? min : abs;
          setHeight(_h);
          currentHeight = _h;
        }
      };
      const handlePointerUp = (e) => {
        hasDown = false;
        const event = e as React.PointerEvent<HTMLElement>;
        pointId && dom.releasePointerCapture(pointId);
        lastHeightRef.current = currentHeight;
      };

      dom.addEventListener("pointerdown", handlePointerDown);
      dom.addEventListener("pointermove", handlePointerMove);
      dom.addEventListener("pointerup", handlePointerUp);
      return () => {
        dom.removeEventListener("pointerdown", handlePointerDown);
        dom.removeEventListener("pointermove", handlePointerMove);
        dom.removeEventListener("pointerup", handlePointerUp);
      };
    }
  }, [ref, lastHeightRef]);

  return { height };
};
