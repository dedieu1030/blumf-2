
import React from 'react';
import { Input } from "./input";

interface InputCurrencyProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value?: number;
  onValueChange?: (value: number) => void;
}

export const InputCurrency = React.forwardRef<HTMLInputElement, InputCurrencyProps>(
  ({ value = 0, onValueChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseFloat(e.target.value) || 0;
      if (onValueChange) {
        onValueChange(value);
      }
    };

    return (
      <Input
        type="number"
        value={value}
        onChange={handleChange}
        ref={ref}
        step="0.01"
        {...props}
      />
    );
  }
);

InputCurrency.displayName = "InputCurrency";
