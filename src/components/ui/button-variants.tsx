import { Button } from "./button";
import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

// Hero button variant for landing page
export const HeroButton = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "primary" | "secondary";
    size?: "default" | "lg";
  }
>(({ className, variant = "primary", size = "lg", ...props }, ref) => {
  return (
    <Button
      ref={ref}
      className={cn(
        "font-semibold transition-all duration-300 transform hover:scale-105",
        size === "lg" && "px-8 py-4 text-lg",
        variant === "primary" && 
          "bg-gradient-primary text-primary-foreground shadow-hero hover:shadow-floating border-0",
        variant === "secondary" && 
          "bg-gradient-secondary text-secondary-foreground shadow-card hover:shadow-floating border-0",
        className
      )}
      {...props}
    />
  );
});

HeroButton.displayName = "HeroButton";

// Academic card button for institutional look
export const AcademicButton = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "outline" | "ghost";
  }
>(({ className, variant = "outline", ...props }, ref) => {
  return (
    <Button
      ref={ref}
      variant={variant}
      className={cn(
        "border-primary/20 text-primary hover:bg-primary/5 hover:border-primary/40 transition-all duration-300",
        className
      )}
      {...props}
    />
  );
});

AcademicButton.displayName = "AcademicButton";