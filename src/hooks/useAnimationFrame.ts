import { useEffect, useRef } from "react";

export function useAnimationFrame(update: () => boolean | void, deps: any[]) {
  const animFrame = useRef(0);

  useEffect(() => {
    const onEnterFrame = () => {
      if (update() === false) return;

      animFrame.current = requestAnimationFrame(onEnterFrame);
    };
    animFrame.current = requestAnimationFrame(onEnterFrame);

    return () => {
      cancelAnimationFrame(animFrame.current);
    };
  }, deps);
}
