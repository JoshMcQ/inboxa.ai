import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";

import { cn } from "@/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-[14px] px-4 h-11 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none text-nowrap transition-colors",
  {
    variants: {
      variant: {
        // Primary (brand indigo)
        default:
          "bg-[var(--brand-indigo)] text-white hover:bg-[var(--brand-indigo-hover)] focus-visible:ring-[rgba(58,71,255,0.4)]",
        primary:
          "bg-[var(--brand-indigo)] text-white hover:bg-[var(--brand-indigo-hover)] focus-visible:ring-[rgba(58,71,255,0.4)]",

        // Backward-compat aliases mapped to Primary
        primaryBlue:
          "bg-[var(--brand-indigo)] text-white hover:bg-[var(--brand-indigo-hover)] focus-visible:ring-[rgba(58,71,255,0.4)]",
        blue:
          "bg-[var(--brand-indigo)] text-white hover:bg-[var(--brand-indigo-hover)] focus-visible:ring-[rgba(58,71,255,0.4)]",

        // Destructive kept as-is (uses theme tokens)
        red:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 focus-visible:ring-destructive",

        // Secondary (outlined)
        green:
          "border border-gray-300 bg-white text-gray-900 hover:bg-gray-50 focus-visible:ring-[rgba(58,71,255,0.25)]",
        outline:
          "border border-gray-300 bg-white text-gray-900 hover:bg-gray-50 focus-visible:ring-[rgba(58,71,255,0.25)]",
        secondary:
          "border border-gray-300 bg-white text-gray-900 hover:bg-gray-50 focus-visible:ring-[rgba(58,71,255,0.25)]",

        // Ghost
        ghost:
          "bg-transparent text-gray-700 hover:bg-gray-100 focus-visible:ring-[rgba(58,71,255,0.25)]",

        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 focus-visible:ring-destructive",

        link: "text-[var(--brand-indigo)] underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-10 px-3 text-sm",
        md: "h-11 px-4 text-sm",       // 44px spec
        lg: "h-12 px-5 text-base",
        icon: "h-11 w-11 rounded-[14px]",   // 44px square with signature radius
        iconSm: "h-10 w-10 rounded-[14px]", // 40px square with signature radius
      },
      loading: {
        true: "opacity-50 cursor-not-allowed",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      loading: false,
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  Icon?: React.ElementType;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      loading = false,
      children,
      Icon,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";
    const type = props.type ?? "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, loading, className }))}
        ref={ref}
        type={type}
        disabled={loading || props.disabled}
        {...props}
      >
        {loading || Icon ? (
          <>
            {loading ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : Icon ? (
              <Icon className="mr-2 size-4" />
            ) : null}
            {children}
          </>
        ) : (
          children
        )}
      </Comp>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
