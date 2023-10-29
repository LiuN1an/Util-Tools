import React, { FC, useEffect, useRef } from "react";

export interface ObserverProps {
  whenTrigger?: () => Promise<void>;
  bottom?: number;
  top?: number;
  enableBottom?: boolean;
  enableTop?: boolean;
  className?: string;
}

const Observer: FC<ObserverProps> = ({
  whenTrigger,
  className = "",
  bottom = 500,
  top = 150,
  enableTop = false,
  enableBottom = false,
}) => {
  const observerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (observerRef.current) {
      const dom = observerRef.current;
      const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          whenTrigger?.();
        }
      });
      observer.observe(dom);
      return () => {
        observer.unobserve(dom);
        observer.disconnect();
      };
    }
  }, [observerRef.current]);

  return (
    <div
      ref={observerRef}
      data-x="sensor"
      className={className}
      style={{
        width: "100%",
        height: "1px",
        ...(enableTop
          ? {
              top: `${top}px`,
            }
          : {}),
        ...(enableBottom
          ? {
              bottom: `${bottom}px`,
            }
          : {}),
      }}
    />
  );
};

export default Observer;
