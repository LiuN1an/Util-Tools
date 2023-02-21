import classNames from "classnames";
import React, {
  ComponentType,
  useRef,
  useEffect,
  useState,
  useMemo,
  FC,
} from "react";
import { createEscape, useTailWindFade } from "./fade";

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
}

export const CreateDropDown: FC<CreateDropDownProps> = ({
  dom,
  align = "left",
  content: Content,
  onClose,
  modalClass,
  leaveAnimate,
  enterAnimate,
  overlayClickDisable = false,
  disableMobile = false,
}) => {
  const isMobile = true;
  const containerRef = useRef<HTMLDivElement>(null);
  const [rect, setRect] = useState<DOMRect>(undefined);
  const { className, style, setOpen } = useTailWindFade({ open: true });

  useEffect(() => {
    if (dom) {
      const _rect = dom.getBoundingClientRect();
      setRect(_rect);
    }
  }, [dom]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !overlayClickDisable) {
        const { x, y } = e;
        const _rect = containerRef.current.getBoundingClientRect();
        if (
          x < _rect.left ||
          x > _rect.right ||
          y > _rect.bottom ||
          y < _rect.top
        ) {
          setOpen(false);
          setTimeout(() => {
            onClose?.();
          }, 300);
          e.stopPropagation();
          e.preventDefault();
        }
      }
    };
    document.body.addEventListener("mousedown", handleClick);
    return () => {
      document.body.removeEventListener("mousedown", handleClick);
    };
  }, [onClose, containerRef]);

  /**
   * 目前默认弹框在底部
   */
  const calc = useMemo(() => {
    if (containerRef.current) {
      const { width, height } =
        containerRef.current.getBoundingClientRect();
      const viewWidth = document.body.offsetWidth - 20;
      // default: width > rect.width
      const moveValue = (width - rect.width) / 2;
      let top = 0;
      if (align === "top") {
        top = rect.top - height - 10;
      } else {
        top = rect.top + rect.height + 10;
      }

      if (moveValue + rect.right > viewWidth) {
        return {
          left: viewWidth - width,
          top,
        };
      }
      return {
        // TODO: 左对齐时存在border宽度问题
        left: align === "left" ? rect.left : rect.left - moveValue,
        top,
      };
    }
    return undefined;
  }, [containerRef.current, rect, align]);

  if (!rect) {
    return null;
  }

  return (
    <div
      style={style({
        zIndex: 9999,
        position: "absolute",
        ...(isMobile && !disableMobile
          ? {
              width: "100%",
              left: "0px",
              ...(align === "top" ? { top: "0px" } : { bottom: "0px" }),
            }
          : {
              left: `${calc?.left ? calc.left : 0}px`,
              top: `${calc?.top ? calc.top : 0}px`,
            }),
      })}
      ref={containerRef}
    >
      <div
        className={classNames(
          modalClass,
          ...className(
            `origin-top ease-scale-cub`,
            leaveAnimate,
            enterAnimate
          )
        )}
      >
        <Content
          onClose={() => {
            setOpen(false);
            setTimeout(() => {
              onClose?.();
            }, 300);
          }}
        />
      </div>
    </div>
  );
};

export const callDropDown = (props: DropDownProps) => {
  createEscape({
    render: ({ onClose: onDestroy }) => {
      return (
        <CreateDropDown
          {...props}
          leaveAnimate={"scale-y-0 pointer-events-none opacity-0"}
          enterAnimate={"scale-y-100"}
          onClose={onDestroy}
        />
      );
    },
  });
};
