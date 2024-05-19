export const useTimeout = (timeout = 1000): [boolean, () => void] => {
  const counterRef = useRef<NodeJS.Timeout>(null);
  const [isEnter, setEnter] = useState(false);

  const startTimeout = useCallback(() => {
    setEnter(true);
    if (counterRef.current) {
      clearTimeout(counterRef.current);
    }
    counterRef.current = setTimeout(() => {
      setEnter(false);
    }, timeout);
  }, [timeout]);

  return [isEnter, startTimeout];
};

/**
 * 一直重试异步函数直到成功，直到超时
 * 如果异步函数throw错误,则会重试，如果不报错，就会显示通过
 */

export const useRetry = (
  cb: (props: { stop: () => void }) => void | Promise<void>,
  props?: { maxRetryCount?: number; immediate?: boolean; gap?: number }
) => {
  const { maxRetryCount = 30, immediate = true, gap = 1500 } = props || {};
  const [isAccess, setAccess] = useState(false);
  const [overLimit, setOverLimit] = useState(false);

  const tryFetch = useCallback(
    async (count: number) => {
      let innerStop = false;
      const stop = () => {
        innerStop = true;
      };
      if (count > 0) {
        try {
          await cb({
            stop,
          });
          setAccess(true);
        } catch (e) {
          if (!innerStop) setTimeout(() => tryFetch(count - 1), gap);
        }
      } else {
        setOverLimit(true);
      }
      return stop;
    },
    [cb, gap]
  );

  useEffect(() => {
    if (immediate) {
      const close = tryFetch(maxRetryCount);
      return () => {
        close?.then((cb) => cb());
      };
    }
  }, [tryFetch, maxRetryCount, immediate]);

  const trigger = useCallback(() => {
    if (immediate) return undefined;
    tryFetch(maxRetryCount);
    setOverLimit(false);
  }, [tryFetch, maxRetryCount, immediate]);

  return {
    access: isAccess,
    overLimit,
    trigger,
  };
};

/**
 * 一个进度追踪钩子
 * 传入进度的最大值和最小值以及每一进度增长的步长
 * timeUnit是这一步与下一步的delay长度,可以传入函数根据当前的count动态设置
 */
export const useCounter = (props?: {
  max?: number;
  min?: number;
  step?: number;
  timeUnit?: number | ((current: number) => number);
}) => {
  const { max = 100, min = 0, step = 1, timeUnit = 1000 } = props || {};
  const [_count, setCount] = useState(max);
  // const intervaler = useRef(null);
  const lastCount = useRef(max);

  const start = useCallback(() => {
    let interval: NodeJS.Timer | undefined;
    interval = setInterval(
      () => {
        setCount((n) => (n > min ? n - step : n));
        lastCount.current = lastCount.current - step;
      },
      typeof timeUnit === "function" ? timeUnit(lastCount.current) : timeUnit
    );

    return () => {
      clearInterval(interval);
    };
  }, [min, step]);

  // useEffect(() => {
  //   const _i = intervaler.current;
  //   if (_count <= 0) {
  //     if (_i) {
  //       clearInterval(_i);
  //     }
  //   }
  //   return () => {
  //     clearInterval(_i);
  //   };
  // }, [_count, intervaler.current]);

  return {
    count: _count,
    start,
  };
};

export const useListenIntersection = (fn) => {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.intersectionRatio >= 0.75) {
              fn(true);
            } else {
              fn(false);
            }
          });
        },
        {
          threshold: 0.75,
        }
      );

      if (ref.current) {
        observer.observe(ref.current);
      }

      return () => {
        if (ref.current) {
          observer.unobserve(ref.current);
        }
      };
    }
  }, [ref.current]);

  return ref;
};

export const useMediaQuery = (query, defaultMatches = true) => {
  const [matches, setMatches] = useState(defaultMatches);

  const canMatch =
    typeof window !== "undefined" && typeof window.matchMedia === "function";

  const queryMatches = useCallback(() => {
    const mediaQuery = window.matchMedia(query);
    setMatches(!!mediaQuery.matches);
  }, [query]);

  useEffect(() => {
    if (!canMatch) {
      return;
    }

    queryMatches();

    const mediaQuery = window.matchMedia(query);

    mediaQuery.addListener(queryMatches);

    return () => {
      mediaQuery.removeListener(queryMatches);
    };
  }, [query, canMatch, queryMatches]);

  return matches;
};
