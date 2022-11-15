import React, {
  ComponentType,
  FC,
  ReactElement,
  ReactNode,
  useEffect,
  useState,
} from "react";
import { createRoot, unmountComponentAtNode } from "react-dom";
import classnames from "classnames";

export const useTailWindFade = (option: { open: boolean }) => {
  const [open, setOpen] = useState(option.open || false);
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
    style: (common: string, leave: string, enter: string) => {
      return [
        "duration-300 transition-all z-10",
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

export const createEscape = (props: {
  render: (args: { onClose: () => void }) => ReactNode;
}): void => {
  const { render } = props;
  const escapeNode = document.createElement("div");
  const body = document.getElementById("__next");
  body.appendChild(escapeNode);
  const onClose = () => {
    unmountComponentAtNode(escapeNode);
    if (body.contains(escapeNode)) {
      body.removeChild(escapeNode);
    }
  };
  const Child = render({ onClose });
  createRoot(escapeNode).render(<>{Child}</>);
};

export interface BaseModalProps {
  onClose?: () => void;
}

export interface ConfirmModalProps {
  type: "confirm";
  onCancel?: () => Promise<boolean | undefined>;
  onOk?: () => Promise<boolean | undefined>;
}

export type CreateCoverProps = {
  isCoverClose?: boolean;
  render?: ComponentType<BaseModalProps>;
  onClose?: () => void;
};

export const CreateCover: FC<CreateCoverProps> = ({
  isCoverClose = true,
  render: Render,
  onClose,
  ...rest
}) => {
  const { style: coverStyle, setOpen: setCoverOpen } = useTailWindFade({
    open: true,
  });
  const { style, setOpen } = useTailWindFade({ open: true });

  return (
    <>
      <div
        className={classnames(
          ...coverStyle(
            "fixed top-0 bottom-0 left-0 right-0 bg-black",
            "opacity-0",
            "opacity-70"
          )
        )}
        onClick={() => {
          if (isCoverClose) {
            setOpen(false);
            setCoverOpen(false);
            setTimeout(() => {
              onClose?.();
            }, 300);
          }
        }}
      />
      <div
        className={classnames(
          ...style(
            "fixed left-1/2 top-1/3 -translate-x-1/2  w-1/3 h-1/4 bg-white rounded-lg",
            "-translate-y-1/2 opacity-0 pointer-events-none",
            "-translate-y-1/3"
          )
        )}
      >
        {Render && (
          <Render
            {...rest}
            onClose={() => {
              setOpen(false);
              setCoverOpen(false);
              setTimeout(() => {
                onClose?.();
              }, 300);
            }}
          />
        )}
      </div>
    </>
  );
};

const Confirm: FC<Omit<ConfirmModalProps, "type"> & BaseModalProps> = ({
  onClose,
  onCancel,
  onOk,
}) => {
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1"></div>
      <div className="p-3 h-12 flex items-center justify-end gap-2">
        <button onClick={() => onClose?.()}>Cancel</button>
        <button
          onClick={async () => {
            if (await onOk?.()) {
              onClose?.();
            }
          }}
        >
          Ok
        </button>
      </div>
    </div>
  );
};

export type CallModalProps = (ConfirmModalProps | { type: "image" }) & {
  onClose?: () => void;
};

export const callModal = (props: CallModalProps) => {
  const { type, onClose, ...rest } = props;

  const render = () => {
    if (type === "confirm") {
      return Confirm as ComponentType<BaseModalProps>;
    }
  };

  createEscape({
    render: ({ onClose: onDestroy }) => {
      return (
        <CreateCover
          onClose={() => {
            onClose?.();
            onDestroy();
          }}
          render={render()}
          {...rest}
        />
      );
    },
  });
};
