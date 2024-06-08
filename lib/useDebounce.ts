import { useEffect, useState } from "react";

export const useDebounce = <T>(value: T, delay = 500) => {

  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timeout);
    };
  }, [value, delay]); // devuelve un value que se recibe por argumentos pasado un cierto tiempo también pasado por argumentos

  return debouncedValue;
};