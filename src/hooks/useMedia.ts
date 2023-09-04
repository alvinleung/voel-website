import { MutableRefObject, useEffect, useRef, useState } from "react";
import { useAnimationFrame } from "./useAnimationFrame";
import { useEventListener } from "usehooks-ts";

export function useMedia<T extends HTMLAudioElement | HTMLVideoElement>() {
  const ref = useRef() as MutableRefObject<T>;
  const [duration, setDuration] = useState(0);

  // useEventListener(
  //   "loadedmetadata",
  //   () => {
  //     console.log("loaded");
  //     setDuration(ref.current.duration);
  //   },
  //   ref
  // );

  useEffect(() => {
    if (ref.current.duration !== 0) {
      setDuration(ref.current.duration);
      return;
    }
    const handleMetadataLoaded = () => {
      setDuration(ref.current.duration);
    };
    ref.current.addEventListener("loadedmetadata", handleMetadataLoaded);

    return () => {
      ref.current.removeEventListener("loadedmetadata", handleMetadataLoaded);
    };
  }, []);
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
    if (isNaN(targetSecond.current)) {
      console.log("target second NAN: " + targetSecond.current);
      return;
    }
    ref.current.currentTime = targetSecond.current;
    isSeeking.current = false;
  }, []);

  return {
    ref,
    play,
    pause,
    seek,
    duration,
  };
}
