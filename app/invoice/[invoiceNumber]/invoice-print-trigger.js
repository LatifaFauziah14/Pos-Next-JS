"use client";

import { useEffect, useRef } from "react";

export function InvoicePrintTrigger({ enabled }) {
  const triggeredRef = useRef(false);

  useEffect(() => {
    if (!enabled || triggeredRef.current) {
      return;
    }

    triggeredRef.current = true;
    window.print();
  }, [enabled]);

  return null;
}
