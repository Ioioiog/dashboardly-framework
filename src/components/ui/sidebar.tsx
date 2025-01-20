import { forwardRef } from "react"
import { Slot } from "@radix-ui/react-slot"
import { VariantProps, cva } from "class-variance-authority"
import { PanelLeft } from "lucide-react"
import { cn } from "@/lib/utils"

const sidebarVariants = cva("flex flex-col", {
  variants: {
    variant: {
      default: "bg-white shadow-md",
      transparent: "bg-transparent",
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

interface SidebarProps extends VariantProps<typeof sidebarVariants> {
  children: React.ReactNode
  className?: string
}

const Sidebar = forwardRef<HTMLDivElement, SidebarProps>(({ variant, className, children }, ref) => {
  return (
    <div ref={ref} className={cn(sidebarVariants({ variant }), className)}>
      {children}
    </div>
  )
})
Sidebar.displayName = "Sidebar"

const SidebarContent = forwardRef<HTMLDivElement, { children: React.ReactNode }>(
  ({ children }, ref) => (
    <div ref={ref} className="flex-1 overflow-auto">
      {children}
    </div>
  )
)
SidebarContent.displayName = "SidebarContent"

interface SidebarContext {
  expanded: boolean
  toggleSidebar: () => void
}

const SidebarContext = createContext<SidebarContext | null>(null)

export const SidebarProvider = ({ children }: { children: React.ReactNode }) => {
  const [expanded, setExpanded] = useState(false)

  const toggleSidebar = useCallback(() => {
    setExpanded((prev) => !prev)
  }, [])

  const value = useMemo(() => ({ expanded, toggleSidebar }), [expanded, toggleSidebar])

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
}

export const useSidebar = () => {
  const context = useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}

export { Sidebar, SidebarContent }