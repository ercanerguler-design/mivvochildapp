"use client";

import { useEffect } from "react";

export function ResultRedirect({ href }: { href: string }) {
  useEffect(() => {
    try {
      (window.top ?? window).location.href = href;
    } catch {
      window.location.href = href;
    }
  }, [href]);

  return (
    <div className="flex min-h-[300px] items-center justify-center p-6 text-center text-sm text-gray-600">
      <p>
        Yönlendiriliyorsunuz…{" "}
        <a href={href} target="_top" className="font-semibold text-violet-700 underline">
          Devam et
        </a>
      </p>
    </div>
  );
}
