import React, { ReactNode } from "react";
import clsx from "clsx";

type ButtonProps = {
  children: ReactNode;
  onClick?: () => void;
  type: 'submit' | 'reset' | 'button';
  variant?: "primary" | "secondary" | "outline" | "ghost";
  disabled?: boolean;
  className?: string;
  icon?: ReactNode;
};


export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  type,
  variant = "primary",
  disabled = false,
  className,
  icon,
}) => {
  const variantStyles = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    secondary: "bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500",
    outline:
      "border border-gray-500 text-gray-700 hover:bg-gray-100 focus:ring-gray-500",
    ghost: "bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        variantStyles[variant],
        disabled && "opacity-50 cursor-not-allowed",
        "px-4 py-3 rounded-lg focus:outline-none transition-colors",
        className
      )}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
};
