import { BaseModalProps, PropsModal } from "./type";
import React, { useEffect, FC } from "react";

export interface ContainerModalProps extends BaseModalProps {
  type: "container";
  content?: FC<{ onClose: () => void; isMobile?: boolean }>;
}

export const Container: FC<PropsModal<ContainerModalProps>> = ({
  isMobile,
  onClose,
  content: Content,
}) => {
  useEffect(() => {
    const handleKeyDown = async (event) => {
      if (event.key === "Escape") {
        onClose?.();
        event.preventDefault();
        event.stopPropagation();
      }
    };

    document.body.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <article className="relative w-full h-full">
      <header className="select-none text-xl font-bold relative w-full h-full">
        <Content onClose={onClose} isMobile={isMobile} />
      </header>
    </article>
  );
};
