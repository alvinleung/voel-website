import { MotionValue, clamp, useMotionValue } from "framer-motion";
import { MutableRefObject, useEffect, useRef, useState } from "react";
import { useFollowMotionValue } from "./useFollowMotionValue";

type Scrub = [
  MutableRefObject<HTMLDivElement>,
  MotionValue,
  MotionValue,
  boolean
];

export function useScrub(): Scrub {
  const containerRef = useRef() as MutableRefObject<HTMLDivElement>;

  const target = useMotionValue(0);
  const [current, isMoving] = useFollowMotionValue(target);

  const [isUsingDrag, setIsUsingDrag] = useState(false);
  const [isScrubbing, setIsScrubbing] = useState(false);

  useEffect(() => {
    if (!isMoving && !isUsingDrag) {
      setIsScrubbing(false);
    }
  }, [isMoving, isUsingDrag]);

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

      const updatedTarget = clamp(-Infinity, 0, target.get() + deltaY);
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
  }, [containerRef]);

  useEffect(() => {
    const elm = containerRef.current;
    const handleContainerWheel = (e: WheelEvent) => {
      // delta y
      const scrollDelta = e.deltaY * 1;
      target.set(target.get() - scrollDelta);
      setIsScrubbing(true);
    };

    elm.addEventListener("wheel", handleContainerWheel, { passive: true });
    return () => {
      elm.removeEventListener("wheel", handleContainerWheel);
    };
  }, []);

  return [containerRef, current, target, isScrubbing];
}
