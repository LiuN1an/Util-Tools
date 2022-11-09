import React from "react";
import { useTailWindFade } from "./fade";
import classnames from "classname";

export const App = () => {
  const { setOpen, style } = useTailWindFade();

  return (
    <div
      className={classnames(
        ...style(
          "fixed top-0 left-0 right-0 bottom-0 bg-black z-[1000]",
          "pointer-events-none opacity-0",
          "opacity-60"
        )
      )}
    ></div>
  );
};
