import { MutableRefObject, useLayoutEffect, useRef, useState } from "react";
import { useWindowDimension } from "./useWindowDimension";

type BoundingBoxInfo = {
  x: number;
  y: number;
  width: number;
  height: number;
  left: number;
  right: number;
  top: number;
  bottom: number;
};

export function useBoundingBox<T extends HTMLElement>(
  dependency: any[]
): [MutableRefObject<T>, BoundingBoxInfo] {
  const containerRef = useRef<T>() as MutableRefObject<T>;

  const windowDim = useWindowDimension();
  // const isPresent = useIsPresent();

  const [bounds, setBounds] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  });

  useLayoutEffect(() => {
    // don't update layout when it is transitioning away
    // if (!isPresent) return;
    if (containerRef.current === null) return;
    const bounds = containerRef.current.getBoundingClientRect();

    const scrollOffset = document.body.scrollTop;

    setBounds({
      x: bounds.x,
      y: bounds.y + scrollOffset,
      width: bounds.width,
      height: bounds.height,
      left: bounds.left,
      right: bounds.right,
      top: bounds.top + scrollOffset,
      bottom: bounds.bottom + scrollOffset,
    });
  }, [windowDim, ...dependency]);

  return [containerRef, bounds];
}
