import type { CSSProperties } from "react";

import { cn } from "@/lib/utils";
import styles from "./book-loader.module.css";

type BookLoaderProps = {
  className?: string;
  label?: string;
  size?: string;
};

/** A compact, accessible open-book loader with continuously turning pages. */
export function BookLoader({
  className,
  label = "Loading",
  size = "1.5rem",
}: BookLoaderProps) {
  return (
    <span
      aria-label={label}
      className={cn(styles.loader, className)}
      role="status"
      style={{ "--book-loader-size": size } as CSSProperties}
    >
      <span aria-hidden="true" className={styles.book}>
        {Array.from({ length: 5 }, (_, index) => (
          <span className={styles.page} key={index} />
        ))}
        <span className={styles.spine} />
      </span>
      <span className="sr-only">{label}</span>
    </span>
  );
}
