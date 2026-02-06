import * as React from "react"
import { cn } from "@/app/lib/utils"
import { Button, type ButtonProps } from "@/app/components/ui/Button"
import LoadingSpinner from "../loader/loading"
import { Loader, Loader2 } from "lucide-react";

interface PrimaryButtonProps extends ButtonProps {
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  isLoading?: boolean;
  loadingText?: string;
}

const PrimaryButton = React.forwardRef<HTMLButtonElement, PrimaryButtonProps>(
  ({ className, children, startIcon, endIcon, isLoading, loadingText, disabled, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        className={cn(
          "rounded-sm bg-[#2D3E2D] hover:bg-[#4A5F4A] text-white transition-all duration-300",
          "disabled:bg-[#2D3E2D]/50",
          "inline-flex items-center justify-center gap-2",
          className,
        )}
        disabled={isLoading || disabled}
        {...props}
      >
        
  {isLoading ? (
          <>
        <Loader2 className="animate-spin" />
            {loadingText || children}
          </>
        ) : (
          <>
            {startIcon && <span className="inline-flex">{startIcon}</span>}
            {children}
            {endIcon && <span className="inline-flex">{endIcon}</span>}
          </>
        )}
        
       
       
      </Button>
    )
  }
)

PrimaryButton.displayName = "PrimaryButton"

export { PrimaryButton, type PrimaryButtonProps }