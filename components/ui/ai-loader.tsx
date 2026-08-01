import { cn } from "@/lib/utils";

const label = "Generating";

type AiLoaderProps = {
  className?: string;
};

export const Component = ({ className }: AiLoaderProps) => {
  return (
    <div
      role="status"
      aria-label="EduHive is generating a response"
      aria-live="polite"
      className={cn("loader-wrapper", className)}
    >
      <span aria-hidden="true" className="flex">
        {Array.from(label).map((letter, index) => (
          <span
            className="loader-letter"
            key={`${letter}-${index}`}
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            {letter}
          </span>
        ))}
      </span>

      <span aria-hidden="true" className="loader" />
    </div>
  );
};
