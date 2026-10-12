import { cn } from "cn";

function Alert({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      role="alert"
      data-slot="alert"
      className={cn(
        "relative w-full rounded-lg border border-border/80 bg-muted/30 px-4 py-3 text-sm",
        className,
      )}
      {...props}
    />
  );
}

export { Alert };
