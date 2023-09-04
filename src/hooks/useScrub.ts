import {
  MotionValue,
  clamp,
  useMotionValue,
  useTransform,
} from "framer-motion";
import { MutableRefObject, useEffect, useRef, useState } from "react";
import { useFollowMotionValue } from "./useFollowMotionValue";
import { useWindowDimension } from "./useWindowDimension";

type Scrub = [
  MutableRefObject<HTMLDivElement>,
  MotionValue,
  MotionValue,
  boolean
];

export function useScrub({
  maxDistance = Infinity,
  canUseMouseWheel = false,
}): Scrub {
  const containerRef = useRef() as MutableRefObject<HTMLDivElement>;

  const target = useMotionValue(0);
  const [current, isMoving] = useFollowMotionValue(target, -maxDistance, 0);

  const [isUsingDrag, setIsUsingDrag] = useState(false);
  const [isScrubbing, setIsScrubbing] = useState(false);

  useEffect(() => {
    if (!isMoving && !isUsingDrag) {
      setIsScrubbing(false);
    }
  }, [isMoving, isUsingDrag]);

  const windowDim = useWindowDimension();

  const getClampedNewValue = (deltaY: number) => {
    return target.get() + deltaY;

    return clamp(-maxDistance, 0, target.get() + deltaY);
  };

  useEffect(() => {
    const elm = containerRef.current;
    let isDragging = false;
    let prevY = 0;

    const handlePointerDown = (e: PointerEvent) => {
      isDragging = true;
      prevY = e.clientY;
      setIsScrubbing(true);
      setIsUsingDrag(true);
    };
    const handlePointerMove = (e: PointerEvent) => {
      if (!isDragging) return;

      const currY = e.clientY;
      const deltaY = currY - prevY;

      const updatedTarget = getClampedNewValue(deltaY);
      target.set(updatedTarget);

      prevY = currY;
    };
    const handlePointerUp = (e: PointerEvent) => {
      isDragging = false;
      setIsUsingDrag(false);
    };
    const handlePointerCancel = (e: PointerEvent) => {
      isDragging = false;
      setIsUsingDrag(false);
    };

    elm.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointercancel", handlePointerMove);

    return () => {
      elm.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerCancel);
      window.removeEventListener("pointermove", handlePointerMove);
    };
  }, [containerRef, maxDistance, windowDim.height]);

  useEffect(() => {
    if (!canUseMouseWheel) return;
    const handleContainerWheel = (e: WheelEvent) => {
      // delta y
      const scrollDelta = -clamp(-50, 50, e.deltaY * 1);
      target.set(getClampedNewValue(scrollDelta));
      setIsScrubbing(true);
    };

    window.addEventListener("wheel", handleContainerWheel, { passive: true });
    return () => {
      window.removeEventListener("wheel", handleContainerWheel);
    };
  }, [maxDistance, canUseMouseWheel, windowDim.height]);

  return [containerRef, current, target, isScrubbing];
}
