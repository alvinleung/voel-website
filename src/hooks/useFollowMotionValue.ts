import {
  MotionValue,
  useMotionValue,
  useMotionValueEvent,
} from "framer-motion";
import { useRef, useState } from "react";

export function useFollowMotionValue(
  target: MotionValue
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
      const offset = (latest - currentScrollY) * 0.15;

      if (Math.abs(offset) > stopThreshold) {
        current.set(currentScrollY + offset);
        animFrame.current = requestAnimationFrame(performFrameUpdate);
        return;
      }

      current.set(latest);
      setIsMoving(false);
    }

    animFrame.current = requestAnimationFrame(performFrameUpdate);
  });
  return [current, isMoving];
}
