/**
 * Reusable Badge Component
 *
 * Props:
 * - children: Badge text
 * - variant: 'success' | 'warning' | 'danger' | 'info'
 * - size: 'sm' | 'md' | 'lg'
 *
 * Usage:
 * <Badge variant="success">Active</Badge>
 */

const Badge = ({ children, variant = "info", size = "md" }) => {
  const variants = {
    success: "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-600/20",
    warning: "bg-amber-100 text-amber-700 ring-1 ring-amber-600/20",
    danger: "bg-rose-100 text-rose-700 ring-1 ring-rose-600/20",
    info: "bg-blue-100 text-blue-700 ring-1 ring-blue-600/20",
  };

  const sizes = {
    sm: "text-xs px-2.5 py-0.5",
    md: "text-xs px-3 py-1 font-semibold",
    lg: "text-sm px-4 py-1.5 font-semibold",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full ${variants[variant]} ${sizes[size]}`}
    >
      {children}
    </span>
  );
};

export default Badge;
