import { forwardRef, ElementRef, ComponentPropsWithoutRef } from "react"
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"
import { Check, ChevronRight, Circle } from "lucide-react"
import { cn } from "@/lib/utils"

const DropdownMenu = forwardRef<
  ElementRef<typeof DropdownMenuPrimitive.Root>,
  ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Root>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Root ref={ref} className={cn("relative", className)} {...props} />
))

DropdownMenu.displayName = "DropdownMenu"

const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger
const DropdownMenuContent = forwardRef<
  ElementRef<typeof DropdownMenuPrimitive.Content>,
  ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Content
    ref={ref}
    className={cn(
      "z-50 min-w-[8rem] overflow-hidden rounded-md border border-muted bg-background shadow-md animate-in fade-in-80",
      className
    )}
    {...props}
  />
))

DropdownMenuContent.displayName = "DropdownMenuContent"

const DropdownMenuItem = forwardRef<
  ElementRef<typeof DropdownMenuPrimitive.Item>,
  ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 px-2 text-sm text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-accent-foreground",
      className
    )}
    {...props}
  />
))

DropdownMenuItem.displayName = "DropdownMenuItem"

const DropdownMenuLabel = forwardRef<
  ElementRef<typeof DropdownMenuPrimitive.Label>,
  ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Label
    ref={ref}
    className={cn("py-1.5 px-2 text-sm font-semibold text-foreground", className)}
    {...props}
  />
))

DropdownMenuLabel.displayName = "DropdownMenuLabel"

const DropdownMenuSeparator = forwardRef<
  ElementRef<typeof DropdownMenuPrimitive.Separator>,
  ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Separator
    ref={ref}
    className={cn("h-px bg-muted", className)}
    {...props}
  />
))

DropdownMenuSeparator.displayName = "DropdownMenuSeparator"

const DropdownMenuCheckboxItem = forwardRef<
  ElementRef<typeof DropdownMenuPrimitive.CheckboxItem>,
  ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => (
  <DropdownMenuPrimitive.CheckboxItem
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 px-2 text-sm text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-accent-foreground",
      className
    )}
    checked={checked}
    {...props}
  >
    <span className="absolute left-0 inline-flex items-center justify-center">
      {checked && <Check className="h-4 w-4" />}
    </span>
    {children}
  </DropdownMenuPrimitive.CheckboxItem>
))

DropdownMenuCheckboxItem.displayName = "DropdownMenuCheckboxItem"

const DropdownMenuRadioItem = forwardRef<
  ElementRef<typeof DropdownMenuPrimitive.RadioItem>,
  ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.RadioItem>
>(({ className, children, checked, ...props }, ref) => (
  <DropdownMenuPrimitive.RadioItem
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 px-2 text-sm text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-accent-foreground",
      className
    )}
    checked={checked}
    {...props}
  >
    <span className="absolute left-0 inline-flex items-center justify-center">
      {checked && <Circle className="h-4 w-4" />}
    </span>
    {children}
  </DropdownMenuPrimitive.RadioItem>
))

DropdownMenuRadioItem.displayName = "DropdownMenuRadioItem"

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
}
