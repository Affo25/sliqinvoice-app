import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"

import { cn } from "../../lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        gradient: 
          "bg-gradient-to-r from-[#26a69a] to-[#43a047] text-white font-semibold border-none hover:from-[#229d93] hover:to-[#3d9b40] hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 ease-in-out",
        "gradient-purple": 
          "bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold border-none hover:from-purple-600 hover:to-pink-600 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 ease-in-out",
        "gradient-blue": 
          "bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold border-none hover:from-blue-600 hover:to-cyan-600 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 ease-in-out",
        "gradient-orange": 
          "bg-gradient-to-r from-orange-400 to-red-500 text-white font-semibold border-none hover:from-orange-500 hover:to-red-600 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 ease-in-out"
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        xl: "h-12 rounded-lg px-10 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
    style={{height: '40px'}}
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  )
})
Button.displayName = "Button"

export { Button, buttonVariants }