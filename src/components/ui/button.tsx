import * as React from "react"
// `cva` (Class Variance Authority) is used for creating highly composable and customizable Tailwind CSS class strings.
import { cva, type VariantProps } from "class-variance-authority"
// `Slot` from `radix-ui` is used for flexible component rendering, allowing a component to render as a different HTML tag or React component.
import { Slot } from "radix-ui"

// `cn` is a utility function that conditionally joins CSS class names together and merges Tailwind CSS classes.
import { cn } from "@/lib/utils"

/**
 * Defines the style variants and sizes for the Button component using `cva`.
 * This allows for different visual styles and dimensions of buttons (e.g., default, destructive, outline, various sizes).
 * Each variant specifies a set of Tailwind CSS classes.
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*=\'size-\\'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        // Default button style: primary background with foreground text.
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        // Destructive button style: typically red background for warning/error actions.
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        // Outline button style: transparent background with border.
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        // Secondary button style.
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        // Ghost button style: minimal styling, often used for hover effects without strong visual presence.
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        // Link button style: resembles a text link but acts as a button.
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        // Default button size.
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        // Extra-small button size.
        xs: "h-6 gap-1 rounded-md px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*=\'size-\\'])]:size-3",
        // Small button size.
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        // Large button size.
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        // Icon-only button size (default).
        icon: "size-9",
        // Extra-small icon-only button size.
        "icon-xs": "size-6 rounded-md [&_svg:not([class*=\'size-\\'])]:size-3",
        // Small icon-only button size.
        "icon-sm": "size-8",
        // Large icon-only button size.
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default", // Sets the default visual variant.
      size: "default",     // Sets the default size.
    },
  }
)

// Extract the variant props type from buttonVariants for explicit use.
type ButtonVariants = VariantProps<typeof buttonVariants>;

export interface ButtonProps
  extends React.ComponentPropsWithoutRef<"button">,
    ButtonVariants { // Use the extracted type here
  asChild?: boolean; // Optional prop to render as a child component.
}

/**
 * Button Component
 *
 * A highly customizable button component that supports various visual styles, sizes,
 * and can optionally render as a different HTML tag or React component using the `asChild` prop.
 * It integrates with `cva` for robust Tailwind CSS class management.
 *
 * @param {ButtonProps} props - The properties for the component.
 * @param {string} [props.className] - Optional additional CSS classes to apply to the button.
 * @param {keyof typeof buttonVariants.variants.variant} [props.variant] - The visual variant of the button. Defaults to 'default'.
 * @param {keyof typeof buttonVariants.variants.size} [props.size] - The size of the button. Defaults to 'default'.
 * @param {boolean} [props.asChild=false] - If true, the button will render its child component instead of a `button`, merging its props.
 * @param {any} [props...] - Additional props to be passed to the underlying HTML button element or child component.
 * @returns {JSX.Element} The rendered button component.
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot.Root : "button";

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

// Export the Button component and its variants for external use.
export { Button, buttonVariants }
