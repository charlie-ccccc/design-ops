import { InputHTMLAttributes, SelectHTMLAttributes, forwardRef } from 'react';
import './Input.css';

type InputBaseProps = {
  hasError?: boolean;
  className?: string;
};

type TextInputProps = InputBaseProps & InputHTMLAttributes<HTMLInputElement> & {
  as?: 'input';
};

type SelectInputProps = InputBaseProps & SelectHTMLAttributes<HTMLSelectElement> & {
  as: 'select';
  children: React.ReactNode;
};

type InputProps = TextInputProps | SelectInputProps;

export const Input = forwardRef<HTMLInputElement | HTMLSelectElement, InputProps>(
  function Input({ as = 'input', hasError = false, className, ...props }, ref) {
    const cls = [
      'ui-input',
      hasError && 'ui-input--error',
      className,
    ].filter(Boolean).join(' ');

    if (as === 'select') {
      const { children, ...rest } = props as SelectInputProps;
      return (
        <select
          className={cls}
          ref={ref as React.Ref<HTMLSelectElement>}
          {...rest}
        >
          {children}
        </select>
      );
    }

    return (
      <input
        className={cls}
        ref={ref as React.Ref<HTMLInputElement>}
        {...(props as TextInputProps)}
      />
    );
  }
);
