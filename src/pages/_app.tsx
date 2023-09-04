import { WindowDimensionContextProvider } from "@/hooks/useWindowDimension";
import "@/styles/globals.css";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <WindowDimensionContextProvider>
      <Component {...pageProps} />
    </WindowDimensionContextProvider>
  );
}
