import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        // Status variants with glow effects
        success: "border-transparent bg-success text-success-foreground shadow-[0_0_10px_hsl(var(--success)/0.3)] hover:shadow-[0_0_20px_hsl(var(--success)/0.5)] hover:scale-105",
        warning: "border-transparent bg-warning text-warning-foreground shadow-[0_0_10px_hsl(var(--warning)/0.3)] hover:shadow-[0_0_20px_hsl(var(--warning)/0.5)] hover:scale-105",
        danger: "border-transparent bg-danger text-danger-foreground shadow-[0_0_10px_hsl(var(--danger)/0.3)] hover:shadow-[0_0_20px_hsl(var(--danger)/0.5)] hover:scale-105",
        // Premium variants
        "success-glow": "border-transparent bg-success text-success-foreground animate-pulse-glow",
        "premium": "border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 hover:scale-105",
        "glass": "border border-border/50 bg-card/80 backdrop-blur-sm text-foreground hover:bg-card/90",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
