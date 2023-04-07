import { Confirm, ConfirmModalProps } from "./confirm";
import { ContainerModalProps, Container } from "./container";
export * from "./type";

export const options = (type: string) => {
  switch (type) {
    case "confirm":
      return {
        modalClass: `w-80 lg:w-96`,
        component: Confirm,
      };
    case "container":
      return {
        modalClass: `min-w-1/4`,
        component: Container,
      };
    default:
      return {
        modalClass: "w-80 lg:w-96",
        leaveAnimate: "-translate-y-1/2 opacity-0 pointer-events-none",
        enterAnimate: "-translate-y-1/3",
      };
  }
};

export const COMMON_MODAL_STYLE = {
  modal:
    "maxd:bottom-0 maxd:origin-bottom md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2",
  leave: "scale-0 pointer-events-none opacity-0",
  enter: "scale-100",
};

export const MODAL_RIGHT_SLIDE_STYLE = {
  modal:
    "maxd:w-screen maxd:h-screen maxd:top-0 maxd:left-0 md:min-w-1/4 md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2",
  leave: "pointer-events-none opacity-0 md:scale-0 maxd:left-[100%]",
  enter: "md:scale-100 maxd:left-0",
};

export const MODE_MAP = {
  "right-to-left": MODAL_RIGHT_SLIDE_STYLE,
  "bottom-slide": COMMON_MODAL_STYLE,
};

type CustomModalProps = {
  mode?: "bottom-slide" | "right-to-left";
};

export type CallModalProps = CustomModalProps &
  (ConfirmModalProps | ContainerModalProps);
