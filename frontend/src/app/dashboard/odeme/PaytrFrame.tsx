"use client";

import Script from "next/script";

declare global {
  interface Window {
    iFrameResize?: (options: object, selector: string) => void;
  }
}

/** PayTR's iframe plus its official resizer script, so the form never shows an inner scrollbar. */
export function PaytrFrame({ src }: { src: string }) {
  return (
    <>
      <Script src="https://www.paytr.com/js/iframeResizer.min.js" strategy="afterInteractive" onLoad={() => window.iFrameResize?.({}, "#paytriframe")} />
      <iframe id="paytriframe" src={src} title="PayTR güvenli ödeme" className="block w-full border-0" style={{ minHeight: 640 }} scrolling="no" allow="payment" />
    </>
  );
}
