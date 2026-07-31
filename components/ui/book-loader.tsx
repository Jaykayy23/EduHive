import type { CSSProperties } from "react";

import { cn } from "@/lib/utils";

type BookLoaderProps = {
  className?: string;
  label?: string;
  size?: string;
};

const PAGE_PATH =
  "M90,0 L90,120 L11,120 C4.92486775,120 0,115.075132 0,109 L0,11 C0,4.92486775,0 11,0 11,0 L90,0 Z M71.5,81 L18.5,81 C17.1192881,81 16,82.1192881 16,83.5 C16,84.8254834 17.0315359,85.9100387 18.3356243,85.9946823 L18.5,86 L71.5,86 C72.8807119,86 74,84.8807119 74,83.5 C74,82.1745166 72.9684641,81.0899613 71.6643757,81.0053177 L71.5,81 Z M71.5,57 L18.5,57 C17.1192881,57 16,58.1192881 16,59.5 C16,60.8254834 17.0315359,61.9100387 18.3356243,61.9946823 L18.5,62 L71.5,62 C72.8807119,62 74,60.8807119 74,59.5 C74,58.1192881 72.8807119,57 71.5,57 Z M71.5,33 L18.5,33 C17.1192881,33 16,34.1192881 16,35.5 C16,36.8254834 17.0315359,37.9100387 18.3356243,37.9946823 L18.5,38 L71.5,38 C72.8807119,38 74,36.8807119 74,35.5 C74,34.1192881 72.8807119,33 71.5,33 Z";

/** Animated page-turning loader adapted from the Uiverse "curly-goose-54" loader (MIT). */
export function BookLoader({
  className,
  label = "Loading",
  size = "1.5rem",
}: BookLoaderProps) {
  return (
    <span
      aria-label={label}
      className={cn("book-loader", className)}
      role="status"
      style={{ "--book-loader-size": size } as CSSProperties}
    >
      <span aria-hidden="true" className="book-loader__book">
        {Array.from({ length: 6 }, (_, index) => (
          <span className="book-loader__page" key={index}>
            <svg fill="currentColor" viewBox="0 0 90 120">
              <path d={PAGE_PATH} />
            </svg>
          </span>
        ))}
      </span>
      <span className="sr-only">{label}</span>

      <style jsx>{`
        .book-loader {
          --book-loader-background: linear-gradient(135deg, #23c4f8, #275efe);
          --book-loader-shadow: rgba(39, 94, 254, 0.28);
          --book-loader-page: rgba(255, 255, 255, 0.38);
          --book-loader-page-fold: rgba(255, 255, 255, 0.58);
          display: inline-block;
          width: calc(var(--book-loader-size) * 1.43);
          height: var(--book-loader-size);
          position: relative;
          flex: none;
        }

        .book-loader::before,
        .book-loader::after {
          content: "";
          position: absolute;
          bottom: calc(var(--book-loader-size) * 0.06);
          top: 80%;
          width: calc(var(--book-loader-size) * 0.86);
          box-shadow: 0 calc(var(--book-loader-size) * 0.11)
            calc(var(--book-loader-size) * 0.09) var(--book-loader-shadow);
          transform: rotate(-6deg);
        }

        .book-loader::before {
          left: calc(var(--book-loader-size) * 0.03);
        }

        .book-loader::after {
          right: calc(var(--book-loader-size) * 0.03);
          transform: rotate(6deg);
        }

        .book-loader__book {
          position: relative;
          z-index: 1;
          display: block;
          width: 100%;
          height: 100%;
          border-radius: calc(var(--book-loader-size) * 0.1);
          background-image: var(--book-loader-background);
          box-shadow: 0 calc(var(--book-loader-size) * 0.03)
            calc(var(--book-loader-size) * 0.05) var(--book-loader-shadow);
          perspective: calc(var(--book-loader-size) * 4.3);
        }

        .book-loader__page {
          position: absolute;
          top: calc(var(--book-loader-size) * 0.07);
          left: calc(var(--book-loader-size) * 0.07);
          color: var(--book-loader-page);
          opacity: 0;
          transform: rotateY(180deg);
          transform-origin: 100% 50%;
          animation: book-loader-page 3s ease infinite;
        }

        .book-loader__page:nth-child(n + 2) {
          color: var(--book-loader-page-fold);
        }

        .book-loader__page:nth-child(1),
        .book-loader__page:nth-child(6) {
          opacity: 1;
        }

        .book-loader__page:nth-child(2) {
          animation-name: book-loader-page-2;
        }

        .book-loader__page:nth-child(3) {
          animation-name: book-loader-page-3;
        }

        .book-loader__page:nth-child(4) {
          animation-name: book-loader-page-4;
        }

        .book-loader__page:nth-child(5) {
          animation-name: book-loader-page-5;
        }

        .book-loader__page svg {
          display: block;
          width: calc(var(--book-loader-size) * 0.64);
          height: calc(var(--book-loader-size) * 0.86);
        }

        @keyframes book-loader-page {
          0%,
          100% {
            transform: rotateY(180deg);
            opacity: 0;
          }
        }

        @keyframes book-loader-page-2 {
          0% {
            transform: rotateY(180deg);
            opacity: 0;
          }
          20% {
            opacity: 1;
          }
          35%,
          100% {
            opacity: 0;
          }
          50%,
          100% {
            transform: rotateY(0deg);
          }
        }

        @keyframes book-loader-page-3 {
          15% {
            transform: rotateY(180deg);
            opacity: 0;
          }
          35% {
            opacity: 1;
          }
          50%,
          100% {
            opacity: 0;
          }
          65%,
          100% {
            transform: rotateY(0deg);
          }
        }

        @keyframes book-loader-page-4 {
          30% {
            transform: rotateY(180deg);
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          65%,
          100% {
            opacity: 0;
          }
          80%,
          100% {
            transform: rotateY(0deg);
          }
        }

        @keyframes book-loader-page-5 {
          45% {
            transform: rotateY(180deg);
            opacity: 0;
          }
          65% {
            opacity: 1;
          }
          80%,
          100% {
            opacity: 0;
          }
          95%,
          100% {
            transform: rotateY(0deg);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .book-loader__page {
            animation: none;
          }
          .book-loader__page:nth-child(1),
          .book-loader__page:nth-child(2) {
            opacity: 1;
            transform: rotateY(0deg);
          }
        }
      `}</style>
    </span>
  );
}
