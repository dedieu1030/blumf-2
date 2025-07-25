
import { useState, useEffect } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface TaxRateSelectorProps {
  defaultValue: number | string;
  onChange: (value: number) => void;
  showLabel?: boolean;
}

export function TaxRateSelector({ 
  defaultValue = 20, 
  onChange,
  showLabel = true 
}: TaxRateSelectorProps) {
  // Convert defaultValue to number for internal use
  const defaultValueNum = typeof defaultValue === 'string' ? parseFloat(defaultValue) || 0 : defaultValue;

  // Convert number to string for the radio group
  const [selectedOption, setSelectedOption] = useState<string>(
    defaultValueNum === 0 ? "none" : 
    defaultValueNum === 5.5 ? "reduced" :
    defaultValueNum === 10 ? "intermediate" :
    defaultValueNum === 20 ? "standard" : "custom"
  );
  
  const [customRate, setCustomRate] = useState<string>(
    !["none", "reduced", "intermediate", "standard"].includes(selectedOption) 
      ? String(defaultValueNum)
      : ""
  );

  // Apply the default value on component mount or when defaultValue changes
  useEffect(() => {
    if (defaultValue !== undefined) {
      const numValue = typeof defaultValue === 'string' ? parseFloat(defaultValue) || 0 : defaultValue;
      
      setSelectedOption(
        numValue === 0 ? "none" : 
        numValue === 5.5 ? "reduced" :
        numValue === 10 ? "intermediate" :
        numValue === 20 ? "standard" : "custom"
      );
      
      if (![0, 5.5, 10, 20].includes(numValue)) {
        setCustomRate(String(numValue));
      }
    }
  }, [defaultValue]);

  // Handle radio option change
  const handleOptionChange = (value: string) => {
    setSelectedOption(value);
    
    switch(value) {
      case "none":
        onChange(0);
        break;
      case "reduced":
        onChange(5.5);
        break;
      case "intermediate":
        onChange(10);
        break;
      case "standard":
        onChange(20);
        break;
      case "custom":
        // When switching to custom, use the current customRate or default to empty
        const customValue = parseFloat(customRate);
        if (!isNaN(customValue)) {
          onChange(customValue);
        }
        break;
    }
  };

  // Handle custom rate change
  const handleCustomRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomRate(value);
    
    if (selectedOption === "custom") {
      const numericValue = parseFloat(value);
      if (!isNaN(numericValue)) {
        onChange(numericValue);
      } else if (value === "") {
        // Handle empty input case if needed
        onChange(0);
      }
    }
  };

  return (
    <div className="space-y-4">
      {showLabel && (
        <Label htmlFor="tax-rate" className="text-base font-medium">Taux de TVA</Label>
      )}
      <RadioGroup 
        value={selectedOption} 
        onValueChange={handleOptionChange}
        className="flex flex-col space-y-2"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="none" id="tax-none" />
          <Label htmlFor="tax-none">Pas de TVA (0%)</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="reduced" id="tax-reduced" />
          <Label htmlFor="tax-reduced">Taux réduit (5,5%)</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="intermediate" id="tax-intermediate" />
          <Label htmlFor="tax-intermediate">Taux intermédiaire (10%)</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="standard" id="tax-standard" />
          <Label htmlFor="tax-standard">Taux standard (20%)</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="custom" id="tax-custom" />
          <Label htmlFor="tax-custom">Taux personnalisé</Label>
        </div>
        
        {selectedOption === "custom" && (
          <div className="ml-6 mt-2">
            <div className="flex items-center">
              <Input
                id="custom-rate"
                type="number"
                value={customRate}
                onChange={handleCustomRateChange}
                placeholder="8.5"
                className="max-w-[120px]"
                step="0.1"
                min="0"
                max="100"
              />
              <span className="ml-2">%</span>
            </div>
          </div>
        )}
      </RadioGroup>
    </div>
  );
}
