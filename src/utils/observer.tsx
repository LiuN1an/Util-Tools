import React, { FC, useEffect, useRef } from "react";

export interface ObserverProps {
  whenTrigger?: () => Promise<void>;
}

export const Observer: FC<ObserverProps> = ({ whenTrigger }) => {
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
      style={{ width: "100%", height: "1px" }}
    />
  );
};
