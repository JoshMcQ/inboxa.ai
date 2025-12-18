export function Logo({ className, ...props }: { className?: string } & React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h1 className={`font-bold text-primary ${className || "text-2xl"}`} {...props}>
      inboxa.ai
    </h1>
  );
}
