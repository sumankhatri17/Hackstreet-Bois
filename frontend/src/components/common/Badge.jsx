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

const Badge = ({ children, variant = 'info', size = 'md' }) => {
  const variants = {
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800'
  };
  
  const sizes = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5'
  };
  
  return (
    <span className={`inline-flex items-center rounded-full font-medium ${variants[variant]} ${sizes[size]}`}>
      {children}
    </span>
  );
};

export default Badge;