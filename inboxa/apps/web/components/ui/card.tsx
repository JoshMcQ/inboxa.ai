import * as React from "react";

import { cn } from "@/utils";

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: "default" | "elevated" | "ghost" | "glass";
  }
>(({ className, variant = "default", ...props }, ref) => {
  const variants = {
    default: "rounded-xl border bg-card text-card-foreground shadow-sm transition-all duration-normal hover:shadow-md",
    elevated: "rounded-xl bg-card text-card-foreground shadow-lg border-0 transition-all duration-normal hover:shadow-xl",
    ghost: "rounded-xl bg-transparent text-card-foreground border-0 transition-all duration-normal hover:bg-accent/5",
    glass: "rounded-xl bg-card/80 backdrop-blur-md text-card-foreground border border-border/50 shadow-sm transition-all duration-normal hover:shadow-md",
  };
  
  return (
    <div
      ref={ref}
      className={cn(variants[variant], className)}
      {...props}
    />
  );
});
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-2 p-6 pb-4", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "font-semibold leading-tight tracking-tight text-lg",
      className,
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-2", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-4", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

const CardBasic = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-card p-6 text-card-foreground shadow-sm",
      className,
    )}
    {...props}
  />
));
CardBasic.displayName = "CardBasic";

const CardGreen = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <Card
    className={cn(
      "border-green-100 bg-gradient-to-tr from-transparent via-green-50/80 to-green-500/15 dark:border-green-900 dark:from-green-950/50 dark:via-green-900/20 dark:to-green-800/10",
      className,
    )}
    {...props}
  />
));
CardGreen.displayName = "CardGreen";

const ActionCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    icon?: React.ReactNode;
    title: string;
    description: string;
    action?: React.ReactNode;
  }
>(({ className, icon, title, description, action, ...props }, ref) => (
  <CardGreen ref={ref} className={cn("max-w-2xl", className)} {...props}>
    <div className="flex items-center justify-between gap-4 p-6">
      <div className="flex items-start gap-3">
        {icon && (
          <div className="mt-0.5 flex-shrink-0 text-green-600 dark:text-green-400">
            {icon}
          </div>
        )}
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  </CardGreen>
));
ActionCard.displayName = "ActionCard";

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  CardBasic,
  CardGreen,
  ActionCard,
};
