import React, { MutableRefObject, useEffect, useRef } from "react";

enum StripeDirection {
  VERTICAL,
  HORIZONTAL,
}

type Props = {
  width: number;
  height: number;
  direction?: StripeDirection;
  patternInterval?: number;
};

const StripePattern = ({
  width,
  height,
  direction = StripeDirection.VERTICAL,
  patternInterval = 10,
}: Props) => {
  const canvasRef = useRef() as MutableRefObject<HTMLCanvasElement>;

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

    ctx.clearRect(0, 0, width, height);

    const stripeAmount = Math.floor(height / patternInterval);

    for (let i = 0; i < stripeAmount; i++) {
      const lineY = i * patternInterval;
      ctx.beginPath();
      ctx.moveTo(0, lineY);
      ctx.lineTo(width, lineY);
      ctx.lineWidth = 1;
      ctx.strokeStyle = "white";
      ctx.stroke();
      ctx.closePath();
    }
  }, [direction, width, height, patternInterval]);

  return <canvas ref={canvasRef} width={width} height={height} />;
};

export default StripePattern;
