import {
  MutableRefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useAnimationFrame } from "./useAnimationFrame";
import { useEventListener } from "usehooks-ts";
import { clamp } from "framer-motion";

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
    const video = ref.current;

    if (!video) return;

    if (video.duration !== 0) {
      setDuration(ref.current.duration);
      return;
    }
    const handleMetadataLoaded = () => {
      setDuration(ref.current.duration);
    };
    video.addEventListener("loadedmetadata", handleMetadataLoaded);

    return () => {
      video.removeEventListener("loadedmetadata", handleMetadataLoaded);
    };
  }, [ref]);

  const play = useCallback(() => {
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
  }, [ref]);

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

  const pause = useCallback(() => {
    ref.current.pause();
  }, [ref]);

  const isSeeking = useRef(false);
  const targetSecond = useRef(0);
  const seek = useCallback((second: number, instant?: boolean) => {
    targetSecond.current = clamp(0, ref.current.duration, second);

    if (instant) {
      ref.current.currentTime = targetSecond.current;
      return;
    }

    isSeeking.current = true;
  }, []);

  useAnimationFrame(() => {
    if (!isSeeking.current) return;
    if (isNaN(targetSecond.current)) {
      console.log("target second NAN: " + targetSecond.current);
      return;
    }
    console.log(targetSecond.current);
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
