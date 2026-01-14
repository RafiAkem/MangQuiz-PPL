import { useRef, useMemo } from "react";
import { useScroll, type MotionValue } from "framer-motion";

export type UseScrollProgressReturn = {
  scrollXProgress: MotionValue<number>;
  scrollYProgress: MotionValue<number>;
  elementRef: React.RefObject<HTMLDivElement>;
};

export function useScrollProgress(
  target: "document" | "container" = "document"
): UseScrollProgressReturn {
  const elementRef = useRef<HTMLDivElement>(null);
  
  const options = useMemo(() => 
    target === "container" ? { container: elementRef } : undefined,
    [target]
  );

  const { scrollYProgress, scrollXProgress } = useScroll(options);

  return { scrollXProgress, scrollYProgress, elementRef };
}
