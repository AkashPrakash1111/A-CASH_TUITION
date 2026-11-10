import { useEffect, useState } from "react";

/**
 * Scale (max 1) that makes a `contentWidth`-wide paper fit inside the element
 * held by `ref`, so a phone shows the whole sheet width instead of a clipped
 * corner. Recomputed when the element is resized.
 */
export default function useFitScale(ref, contentWidth, active = true) {
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const el = ref.current;
    if (!active || !el) return undefined;
    const update = () => {
      const available = el.clientWidth - 24; // padding
      if (available > 0) setScale(Math.min(1, available / contentWidth));
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, contentWidth, active]);
  return scale;
}
