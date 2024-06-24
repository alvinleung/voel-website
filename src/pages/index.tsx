import Image from "next/image";
import { Inter } from "next/font/google";
import MusicScrubber from "@/components/MusicScrubber";
import { MutableRefObject, useEffect, useRef, useState } from "react";
import Timestamp from "@/components/Timestamp";
import { useMedia } from "@/hooks/useMedia";
import { clamp, useMotionValue, useMotionValueEvent } from "framer-motion";
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

  const [isMainVideoReady, setIsMainVideoReady] = useState(false);
  const [isScrubVideoFrameStale, setIsScrubVideoFrameStale] = useState(false);

  const [shouldPlay, setShouldPlay] = useState(false);

  const scrubVideo = useMedia<HTMLVideoElement>();
  const mainVideo = useMedia<HTMLVideoElement>();

  const currentTime = useMotionValue(0);

  useMotionValueEvent(currentTime, "change", (latestTime) => {
    if (isScrubbing) {
      // when scrub begin, the currentTime will wiggle a
      // little bit as the animation takes a little to stop
      scrubVideo.seek(latestTime);
    }
  });

  useAnimationFrame(() => {
    if (isScrubbing) return false;
    // update currentTime to match the video time when the video is playing
    currentTime.set(mainVideo.ref.current.currentTime);
  }, [isScrubbing]);

  useEffect(() => {
    console.log(`shouldPlay`, shouldPlay);
    console.log(`isScrubbing`, isScrubbing);
    console.log(`scrub-vid`, scrubVideo.ref.current.currentTime);
    console.log(`main-vid`, mainVideo.ref.current.currentTime);
    console.log(`currentTime`, currentTime.get());

    if (isScrubbing || !shouldPlay) {
      mainVideo.pause();
      return;
    }

    mainVideo.play();
  }, [shouldPlay, isScrubbing]);

  useEffect(() => {
    setIsMainVideoReady(false);
    setIsScrubVideoFrameStale(false);

    if (isScrubbing) {
      scrubVideo.pause();
      mainVideo.pause();
      return;
    }
    mainVideo.seek(scrubVideo.ref.current.currentTime);
    setShouldPlay(true);

    // does not depend on mainVideo and scrubVideo state
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isScrubbing]);

  const handleMainVideoReady = () => {
    // if (mainVideo.ref.current.currentTime === 0) return;
    setIsMainVideoReady(true);
  };
  const handleScrubVideoSeeked = () => {
    setIsScrubVideoFrameStale(true);
  };

  return (
    <main
      className={`fixed ${inter.className}`}
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
          {!isMainVideoReady && "buffering... "}
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
              opacity: isMainVideoReady ? 0 : isScrubVideoFrameStale ? 1 : 0,
            }}
            ref={scrubVideo.ref}
            onSeeked={handleScrubVideoSeeked}
            playsInline
          >
            <source src="./media/pendulum/scrub-low.webm" />
          </video>
        </div>
      </div>
    </main>
  );
}
