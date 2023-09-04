import { MotionValue, useMotionValueEvent } from "framer-motion";
import React, { MutableRefObject, useEffect, useState } from "react";

type Props = {
  currentTime: MotionValue<number>;
};

function convertSecondsToTimeString(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  totalSeconds %= 3600;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  // return `${Math.floor(hours)}:${Math.floor(minutes)}:${Math.floor(seconds)}`;
  return `${Math.floor(minutes)}:${Math.floor(seconds)}`;
}

const Timestamp = ({ currentTime }: Props) => {
  const [timeString, setTimeString] = useState("");

  useMotionValueEvent(currentTime, "change", (latest) =>
    setTimeString(convertSecondsToTimeString(latest))
  );

  return <>{timeString}</>;
};

export default Timestamp;
