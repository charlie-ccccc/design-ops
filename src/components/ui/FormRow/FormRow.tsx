import { ReactNode, LabelHTMLAttributes } from 'react';
import './FormRow.css';

type FormRowProps = {
  label: string;
  htmlFor?: string;
  children: ReactNode;
  className?: string;
  labelProps?: LabelHTMLAttributes<HTMLLabelElement>;
};

export function FormRow({ label, htmlFor, children, className, labelProps }: FormRowProps) {
  return (
    <div className={['ui-form-row', className].filter(Boolean).join(' ')}>
      <label htmlFor={htmlFor} {...labelProps}>{label}</label>
      {children}
    </div>
  );
}

type FormGridProps = {
  cols?: 1 | 2;
  children: ReactNode;
  className?: string;
};

export function FormGrid({ cols = 2, children, className }: FormGridProps) {
  return (
    <div
      className={['ui-form-grid', className].filter(Boolean).join(' ')}
      data-cols={cols}
    >
      {children}
    </div>
  );
}
