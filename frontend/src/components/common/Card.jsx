/**
 * Reusable Card Component
 * 
 * Props:
 * - children: Card content
 * - title: Optional card title
 * - className: Additional CSS classes
 * - padding: 'sm' | 'md' | 'lg'
 * 
 * Usage:
 * <Card title="Dashboard">
 *   <p>Card content here</p>
 * </Card>
 */

const Card = ({ 
  children, 
  title, 
  className = '',
  padding = 'md'
}) => {
  const paddingStyles = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };
  
  return (
    <div className={`bg-white rounded-xl shadow-md ${paddingStyles[padding]} ${className}`}>
      {title && (
        <h3 className="text-xl font-bold text-gray-800 mb-4">{title}</h3>
      )}
      {children}
    </div>
  );
};

export default Card;