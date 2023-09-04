import {
  MotionValue,
  clamp,
  useMotionValue,
  useMotionValueEvent,
} from "framer-motion";
import { useRef, useState } from "react";

export function useFollowMotionValue(
  target: MotionValue,
  min: number,
  max: number
): [MotionValue, boolean] {
  const current = useMotionValue(0);
  const animFrame = useRef<number>();
  const stopThreshold = 0.1;

  const [isMoving, setIsMoving] = useState(false);

  useMotionValueEvent(target, "change", (latest) => {
    if (animFrame.current) cancelAnimationFrame(animFrame.current);

    setIsMoving(true);

    function performFrameUpdate() {
      const currentScrollY = current.get();
      const clampedLatest = clamp(min, max, latest);
      const overflow = clampedLatest - latest;
      console.log(clampedLatest);

      const DAMP_MARGIN = 1000;
      const DAMP_CONST = 8;

      const overflowFactor = 1 - overflow / DAMP_MARGIN;
      const dampFactor = DAMP_CONST * overflowFactor;
      const dampedLatest = clampedLatest - overflow / dampFactor;

      const offset = (dampedLatest - currentScrollY) * 0.15;

      if (Math.abs(offset) > stopThreshold) {
        current.set(currentScrollY + offset);
        animFrame.current = requestAnimationFrame(performFrameUpdate);
        return;
      }

      current.set(dampedLatest);
      setIsMoving(false);
    }

    animFrame.current = requestAnimationFrame(performFrameUpdate);
  });
  return [current, isMoving];
}
