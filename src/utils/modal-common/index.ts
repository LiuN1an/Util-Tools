export * from "./type";
import { Confirm, ConfirmModalProps } from "./confirm";

export const options = (type: string) => {
  switch (type) {
    case "confirm":
      return { width: "33.33vw", height: "20vh", component: Confirm };
    default:
      return { width: "30vw", height: "50vh" };
  }
};

export type CallModalProps = ConfirmModalProps;
