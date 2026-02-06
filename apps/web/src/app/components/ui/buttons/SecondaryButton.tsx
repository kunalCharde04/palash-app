import * as React from "react"
import { cn } from "@/app/lib/utils"
import { Button, type ButtonProps } from "@/app/components/ui/Button"

const SecondaryButton = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, ...props }, ref) => {
  return (
    <Button
      ref={ref}
      variant="outline"
      className={cn(
        "rounded-sm border-2 border-[#2D3E2D] bg-transparent text-[#2D3E2D]",
        "hover:bg-[#F5F7F5] hover:text-[#2D3E2D] transition-all duration-300",
        "disabled:border-[#2D3E2D]/50 disabled:text-[#2D3E2D]/50",
        className,
      )}
      {...props}
    />
  )
})
SecondaryButton.displayName = "SecondaryButton"

export { SecondaryButton }
