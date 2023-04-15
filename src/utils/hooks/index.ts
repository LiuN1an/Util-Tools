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
