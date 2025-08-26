"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface SwitchProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, checked, onCheckedChange, ...props }, ref) => {
    return (
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          ref={ref}
          className="sr-only"
          checked={checked}
          onChange={(e) => onCheckedChange?.(e.target.checked)}
          {...props}
        />
        <div
          className={cn(
            "w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700",
            "relative transition-colors duration-200 ease-in-out",
            checked && "bg-blue-600",
            className
          )}
        >
          <div
            className={cn(
              "absolute top-[2px] left-[2px] bg-white border border-gray-300 rounded-full h-5 w-5",
              "transition-transform duration-200 ease-in-out",
              checked && "translate-x-5"
            )}
          />
        </div>
      </label>
    )
  }
)

Switch.displayName = "Switch"

export { Switch }