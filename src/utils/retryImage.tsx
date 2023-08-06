import { FC, ReactNode, useCallback, useEffect, useState } from "react";
import cn from "classnames";

export const RetryImage = (
  props: {
    src: string;
    loadingRender?: ReactNode;
    failRender: FC<{ retry: () => void }>;
    maxRetry?: number;
    gap?: number;
    className?: string;
  } & React.HTMLProps<HTMLImageElement>
) => {
  const {
    src,
    loadingRender,
    failRender: FailRender,
    maxRetry = 100,
    gap = 2000,
    className = "",
    ...rest,
  } = props;
  const [isAccess, setAccess] = useState(false);
  const [overLimit, setOverLimit] = useState(false);

  const tryFetch = useCallback(
    (count: number) => {
      if (isAccess || overLimit) return;
      if (count > 0) {
        const img = new Image();
        if (src) {
          img.src = src;
          img.onload = () => {
            setAccess(true);
          };
          img.onerror = () => {
            setTimeout(() => {
              tryFetch(count - 1);
            }, gap);
          };
          setOverLimit(false);
        }
      } else {
        setOverLimit(true);
      }
    },
    [gap, src, isAccess]
  );

  useEffect(() => {
    tryFetch(maxRetry);
  }, [tryFetch, maxRetry]);

  return isAccess ? (
    <img src={src} className={cn(className)} {...rest} />
  ) : overLimit ? (
    <FailRender
      retry={() => {
        tryFetch(maxRetry);
      }}
    />
  ) : (
    <>{loadingRender}</>
  );
};
