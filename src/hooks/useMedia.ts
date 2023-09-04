import { MutableRefObject, useEffect, useRef } from "react";
import { useAnimationFrame } from "./useAnimationFrame";

export function useMedia<T extends HTMLAudioElement | HTMLVideoElement>() {
  const ref = useRef() as MutableRefObject<T>;

  const play = () => {
    let startPlayPromise = ref.current.play();

    if (startPlayPromise !== undefined) {
      startPlayPromise
        .then(() => {
          // Start whatever you need to do only after playback
          // has begun.
          console.log("playing vid");
        })
        .catch((error) => {
          if (error.name === "NotAllowedError") {
            // showPlayButton(videoElem);
            console.log("now allowed");
          } else {
            // Handle a load or playback error
            console.log(error);
          }
        });
    }

    // if (promise !== undefined) {
    //   promise
    //     .then((_) => {
    //       // Autoplay started!
    //     })
    //     .catch((error) => {
    //       // Autoplay was prevented.
    //       // Show a "Play" button so that user can start playback.
    //     });
    // }
  };

  const pause = () => {
    ref.current.pause();
  };

  const isSeeking = useRef(false);
  const targetSecond = useRef(0);
  const seek = (second: number) => {
    isSeeking.current = true;
    targetSecond.current = second;
  };

  useAnimationFrame(() => {
    if (!isSeeking.current) return;
    ref.current.currentTime = targetSecond.current;
    isSeeking.current = false;
  }, []);

  return {
    ref,
    play,
    pause,
    seek,
  };
}
