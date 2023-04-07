import { ComponentType } from "react";

export interface BaseModalProps {
  onClose?: () => void;
  width?: string;
  height?: string;
  isMobile?: boolean;
}

export interface CreateCoverProps extends BaseModalProps {
  type: string;
  isCoverClose?: boolean;
  render?: ComponentType<BaseModalProps>;
  leaveAnimate?: string;
  enterAnimate?: string;
  modalClass?: string;
  disableMobile?: boolean;
}

export type CreateDropDownProps = DropDownProps & {
  onClose?: () => void;
  leaveAnimate?: string;
  enterAnimate?: string;
  modalClass?: string;
};

export interface DropDownProps {
  dom: HTMLElement;
  align?: "left" | "right" | "center" | "top";
  content: ComponentType<{ onClose: () => void; isMobile?: boolean }>;
  overlayClickDisable?: boolean;
  disableMobile?: boolean;
  arrow?: boolean;
}

export type PropsModal<T extends BaseModalProps> = Omit<T, "type">;
