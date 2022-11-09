import { useState } from "react";

/**
 * 通过返回的 open 来控制动画进入和退出的hook
 * 可以通过 option 覆盖 duration 和 transition
 */
export const useTailWindFade = (option = "") => {
  const [open, setOpen] = useState(false);
  const [isEnter, setEnter] = useState(false);

  useEffect(() => {
    if (open) {
      setOpen(true);
      setTimeout(() => {
        setEnter(true);
      }, 16);
    } else {
      setEnter(false);
      setTimeout(() => {
        setOpen(false);
      }, 300);
    }
  }, [open]);

  return {
    style: (common, leave, enter) => {
      return [
        "duration-300 transition-all",
        option,
        common,
        open ? "block" : "none",
        isEnter ? enter : leave,
      ];
    },
    open,
    setOpen,
  };
};
