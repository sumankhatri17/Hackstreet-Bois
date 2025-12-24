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
  className = "",
  padding = "md",
  hoverable = false,
}) => {
  const paddingStyles = {
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  return (
    <div
      className={`bg-white rounded-lg shadow border border-gray-200 ${
        paddingStyles[padding]
      } ${className} ${
        hoverable
          ? "hover:shadow-md transition-shadow duration-200 cursor-pointer"
          : ""
      }`}
    >
      {title && (
        <h3 className="text-xl font-semibold text-gray-900 mb-4">{title}</h3>
      )}
      {children}
    </div>
  );
};

export default Card;
