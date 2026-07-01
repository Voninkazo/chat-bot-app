import { useState } from "react";
import { IconEye, IconEyeOff } from "@tabler/icons-react";
import { Input } from "./Input";
import clsx from "clsx";

type PasswordInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type"
> & {
  className?: string;
};

export const PasswordInput = ({ className, ...props }: PasswordInputProps) => {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <Input
        {...props}
        type={visible ? "text" : "password"}
        className={clsx("pr-11", className)}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
        tabIndex={-1}
        aria-label={visible ? "Hide password" : "Show password"}
      >
        {visible ? <IconEyeOff size={18} /> : <IconEye size={18} />}
      </button>
    </div>
  );
};
