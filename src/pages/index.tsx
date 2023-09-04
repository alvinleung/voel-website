import Image from "next/image";
import { Inter } from "next/font/google";
import MusicScrubber from "@/components/MusicScrubber";
import { MutableRefObject, useEffect, useRef, useState } from "react";
import Timestamp from "@/components/Timestamp";
import { useMedia } from "@/hooks/useMedia";
import { useMotionValue, useMotionValueEvent } from "framer-motion";
import { useAnimationFrame } from "@/hooks/useAnimationFrame";
import { useBoolean } from "usehooks-ts";

const inter = Inter({ subsets: ["latin"] });

// full-video
// ffmpeg -i pendulum-promo.mp4 -vf scale=1080:1080  -keyint_min 25 -g 25 -c:v libvpx -crf 30 -b:v 0 -b:a 128k -c:a libopus video.webm

// scrub-video
// ffmpeg -i pendulum-promo.mp4 -vf scale=540:540  -keyint_min 25 -g 25 -c:v libvpx -crf 30 -b:v 0 -b:a 128k -c:a libopus scrub.webm
// ffmpeg -i pendulum-promo.mp4 -vf scale=270:270  -keyint_min 25 -g 25 -c:v libvpx -crf 30 -b:v 0 -b:a 128k -c:a libopus scrub-low.webm
export default function Home() {
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);

  const [shouldPlay, setShouldPlay] = useState(false);

  const scrubVideo = useMedia<HTMLVideoElement>();
  const mainVideo = useMedia<HTMLVideoElement>();

  const currentTime = useMotionValue(0);

  useMotionValueEvent(currentTime, "change", (latestTime) => {
    if (isScrubbing) {
      scrubVideo.seek(latestTime);
    }
  });

  useAnimationFrame(() => {
    if (isScrubbing) return false;
    currentTime.set(mainVideo.ref.current.currentTime);
  }, [isScrubbing]);

  useEffect(() => {
    if (isScrubbing || !shouldPlay || !isVideoReady) {
      mainVideo.pause();
      return;
    }

    mainVideo.play();
  }, [shouldPlay, isScrubbing, isVideoReady]);

  useEffect(() => {
    if (isScrubbing) {
      setIsVideoReady(false);
      scrubVideo.pause();
      mainVideo.pause();
      return;
    }
    mainVideo.seek(scrubVideo.ref.current.currentTime);
    setIsVideoReady(false);
    setShouldPlay(true);
  }, [isScrubbing]);

  const handleMainVideoReady = () => {
    if (mainVideo.ref.current.currentTime === 0) return;
    setIsVideoReady(true);
  };

  return (
    <main
      className={`fixed  ${inter.className}`}
      onClick={() => {
        if (isScrubbing) return;
        setShouldPlay(!shouldPlay);
      }}
    >
      <div className="relative h-screen w-screen overflow-hidden">
        <div className="absolute left-[25vw] flex-shrink-0 z-10">
          <MusicScrubber
            onScrubBegin={() => setIsScrubbing(true)}
            onScrubEnd={() => setIsScrubbing(false)}
            currentTime={currentTime}
            maxTime={mainVideo.duration}
            canUseMouseWheel
          />
        </div>
        <div className="absolute right-10 bottom-10 z-10">
          {!isVideoReady && "buffering... "}
          <Timestamp currentTime={currentTime} />
        </div>
        <div className="block h-screen w-screen relative">
          <video
            width={1080}
            height={1080}
            className="h-full w-full object-cover"
            ref={mainVideo.ref}
            onSeeked={handleMainVideoReady}
            playsInline
          >
            <source src="./media/pendulum/pendulum-promo.mp4" />
          </video>
          <video
            className="absolute left-0 top-0  h-full w-full object-cover "
            style={{
              opacity: isScrubbing ? 1 : isVideoReady ? 0 : 1,
            }}
            ref={scrubVideo.ref}
            playsInline
          >
            <source src="./media/pendulum/scrub-low.webm" />
          </video>
        </div>
      </div>
    </main>
  );
}
