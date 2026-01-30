import clsx from "clsx";
import { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

export const Input = ({className = "", ...props}: InputProps) => {
  return (
      <input
          className={clsx(
              "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition",
              className,
          )}
          {...props}
      />
  );
};
