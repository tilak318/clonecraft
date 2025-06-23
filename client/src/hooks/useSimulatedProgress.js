import { useState, useEffect, useRef } from 'react';

function useInterval(callback, delay) {
  const savedCallback = useRef();

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay !== null) {
      const id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

const useSimulatedProgress = (isDownloading, duration = 2000) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isDownloading) {
      setProgress(0);
    }
  }, [isDownloading]);

  useInterval(
    () => {
      if (progress < 99) {
        setProgress(progress + 1);
      }
    },
    isDownloading ? duration / 100 : null,
  );

  return [progress, setProgress];
};

export default useSimulatedProgress; 