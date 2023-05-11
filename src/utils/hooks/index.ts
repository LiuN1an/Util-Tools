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
  cb: () => Promise<void>,
  props?: { maxRetryCount?: number; immediate?: boolean; timeout?: number }
) => {
  const {
    maxRetryCount = 30,
    immediate = true,
    timeout = 1500,
  } = props || {};
  const [isAccess, setAccess] = useState(false);
  const [overLimit, setOverLimit] = useState(false);

  const tryFetch = useCallback(
    async (count: number) => {
      if (count > 0) {
        try {
          await cb();
          setAccess(true);
        } catch (e) {
          setTimeout(() => tryFetch(count - 1), timeout);
        }
      } else {
        setOverLimit(true);
      }
    },
    [timeout]
  );

  useEffect(() => {
    if (immediate) {
      tryFetch(maxRetryCount);
    }
  }, [tryFetch, maxRetryCount, immediate]);

  return {
    access: isAccess,
    overLimit,
    trigger: immediate ? undefined : () => tryFetch(maxRetryCount),
  };
};
