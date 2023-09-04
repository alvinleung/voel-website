import React, { useState } from "react";
import StripePattern from "./StripePattern";
import { useWindowDimension } from "@/hooks/useWindowDimension";
import { motion } from "framer-motion";

type Props = {
  children: React.ReactNode;
};

function InfiniteScrollPattern({ children }: Props) {
  const windowDim = useWindowDimension();

  const [negDirCount, setNegDirCount] = useState(1);
  const [posDirCount, setPosDirCount] = useState(1);

  const addNegativeDirectionCount = () => {
    setNegDirCount((old) => old + 1);
  };
  const addPositiveDirectionCount = () => {
    setPosDirCount((old) => old + 1);
  };

  return (
    <div className="relative">
      {/* negative */}
      <div className="absolute flex h-0 flex-col-reverse">
        {[...Array(negDirCount)].map(() => children)}
        <motion.div onViewportEnter={addNegativeDirectionCount} />
      </div>
      {/* positive */}

      <div className="flex flex-col">
        {[...Array(posDirCount)].map(() => children)}
        <motion.div onViewportEnter={addPositiveDirectionCount} />
      </div>
    </div>
  );
}

export default InfiniteScrollPattern;
