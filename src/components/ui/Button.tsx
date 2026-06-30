import { cn } from "@/lib/cn";

const variants = {
  primary:
    "bg-teal-700 text-white hover:bg-teal-800 shadow-sm shadow-teal-900/10",
  secondary:
    "bg-white text-teal-900 border border-teal-200 hover:bg-teal-50",
  ghost: "text-teal-800 hover:bg-teal-50",
  premium:
    "bg-amber-500 text-white hover:bg-amber-600 shadow-sm shadow-amber-900/10",
};

const sizes = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  href?: string;
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors disabled:opacity-50",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function LinkButton({
  href,
  className,
  variant = "primary",
  size = "md",
  children,
}: {
  href: string;
  className?: string;
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors",
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </a>
  );
}
