import React, {
  MutableRefObject,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import StripePattern from "./StripePattern";
import { MotionValue, motion, useMotionValueEvent } from "framer-motion";
import InfiniteScrollPattern from "./InfiniteScrollPattern";
import { useWindowDimension } from "@/hooks/useWindowDimension";
import { ScrubDirection, useScrub } from "@/hooks/useScrub";
import { useAnimationFrame } from "@/hooks/useAnimationFrame";

type Props = {
  onScrubEnd?: () => void;
  onScrubBegin?: () => void;
  currentTime: MotionValue<number>;
  pixelPerSecond?: number;
  maxTime: number;
  canUseMouseWheel?: boolean;
};

const MusicScrubber = ({
  onScrubBegin,
  onScrubEnd,
  currentTime,
  pixelPerSecond = 100,
  maxTime,
  canUseMouseWheel,
}: Props) => {
  const windowDim = useWindowDimension();

  const {
    containerRef: scrubContainerRef,
    current: yPos,
    target: yPosTarget,
    isScrubbing,
  } = useScrub({
    maxDistance: maxTime * pixelPerSecond,
    canUseMouseWheel: canUseMouseWheel,
    direction: ScrubDirection.y,
    canWheelAnywhere: true,
  });
  useMotionValueEvent(yPos, "change", (latest) => {
    if (!isScrubbing) return;

    currentTime.set(-latest / pixelPerSecond);
  });

  useEffect(() => {
    if (!isScrubbing) {
      onScrubEnd?.();
      return;
    }
    onScrubBegin?.();
  }, [isScrubbing]);

  useMotionValueEvent(currentTime, "change", (latest) => {
    if (isScrubbing) {
      return false;
    }
    yPosTarget.set(-latest * pixelPerSecond);
  });

  return (
    <motion.div
      className={`h-full`}
      ref={scrubContainerRef}
      whileHover={{
        cursor: "grab",
      }}
      style={{ touchAction: "none" }}
      whileTap={{ cursor: "grabbing" }}
    >
      <motion.div
        className="relative"
        style={{
          y: yPos,
        }}
      >
        <InfiniteScrollPattern>
          <StripePattern
            width={100}
            height={windowDim.height * 2}
            patternInterval={windowDim.height / 20}
          />
        </InfiniteScrollPattern>
      </motion.div>
    </motion.div>
  );
};

export default MusicScrubber;
