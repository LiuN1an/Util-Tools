import { Button } from "@chakra-ui/react";
import React, { FC } from "react";
import { BaseModalProps, PropsModal } from "./type";

export interface ConfirmModalProps extends BaseModalProps {
  type: "confirm";
  onCancel?: () => Promise<boolean | undefined>;
  onOk?: () => Promise<boolean | undefined>;
  width?: string;
  height?: string;
}

export const Confirm: FC<PropsModal<ConfirmModalProps>> = ({
  onClose,
  onCancel,
  onOk,
}) => {
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1"></div>
      <div className="p-3 h-12 flex items-center justify-end gap-2">
        <Button onClick={() => onClose?.()}>Cancel</Button>
        <Button
          onClick={async () => {
            if (await onOk?.()) {
              onClose?.();
            }
          }}
        >
          Ok
        </Button>
      </div>
    </div>
  );
};
