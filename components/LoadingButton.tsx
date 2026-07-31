import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { BookLoader } from "./ui/book-loader";
import React from "react";

type ButtonProps = React.ComponentProps<typeof Button>;

interface LoadingButtonProps extends ButtonProps {
  loading: boolean;
}

export default function LoadingButton({
  loading,
  disabled,
  className,
  ...props
}: LoadingButtonProps) {
  return (
    <Button
      disabled={loading || disabled}
      className={cn("flex items-center gap-2", className)}
      {...props}
    >
      {loading && <BookLoader size="1.25rem" />}
      {props.children}
    </Button>
  );
}
