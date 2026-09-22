"use client";

import { useLayoutEffect } from "react";

export default function LoginSplashCleanup() {
  useLayoutEffect(() => {
    document.getElementById("dreamsmm-login-splash")?.remove();
  }, []);

  return null;
}
