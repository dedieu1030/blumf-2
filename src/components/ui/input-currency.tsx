
import * as React from "react";
import { Input } from "./input";

export interface InputCurrencyProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value: number;
  onValueChange: (value: number) => void;
  currency?: string;
}

export const InputCurrency = React.forwardRef<HTMLInputElement, InputCurrencyProps>(
  ({ value, onValueChange, currency = "€", ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value === '' ? 0 : parseFloat(e.target.value);
      if (!isNaN(newValue)) {
        onValueChange(newValue);
      }
    };

    return (
      <Input
        type="number"
        value={value}
        onChange={handleChange}
        step="0.01"
        ref={ref}
        {...props}
      />
    );
  }
);

InputCurrency.displayName = "InputCurrency";
