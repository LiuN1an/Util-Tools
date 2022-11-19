import React, { FC, ReactNode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { CallModalProps, CreateCoverProps, options } from "./modal-common";
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
  let root: any;
  const onClose = () => {
    root.unmount();
    if (body.contains(escapeNode)) {
      body.removeChild(escapeNode);
    }
  };
  const Child = render({ onClose });
  root = createRoot(escapeNode);
  root.render(<>{Child}</>);
};

export const CreateCover: FC<CreateCoverProps> = ({
  type,
  isCoverClose = true,
  render: Render,
  onClose,
  width,
  height,
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
        style={{ width: width, height: height }}
        className={classnames(
          ...style(
            "fixed left-1/2 top-1/3 -translate-x-1/2 bg-white rounded-lg",
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
            width={width}
            height={height}
          />
        )}
      </div>
    </>
  );
};

export const callModal = (props: CallModalProps) => {
  const { type, onClose } = props;

  const { component, width, height } = options(type);

  createEscape({
    render: ({ onClose: onDestroy }) => {
      return (
        <CreateCover
          {...props}
          onClose={() => {
            onClose?.();
            onDestroy();
          }}
          render={component}
          width={width}
          height={height}
        />
      );
    },
  });
};
