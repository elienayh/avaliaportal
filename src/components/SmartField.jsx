import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Campo que usa uma lista cadastrada (Select) e permite digitar manualmente
// como alternativa (ou quando não há opções cadastradas).
export default function SmartField({
  id,
  label,
  options = [],
  value,
  onChange,
  placeholder,
  required,
  disabled,
}) {
  const hasOptions = options.length > 0;
  const isCustomValue = hasOptions && value !== "" && !options.includes(value);
  const [mode, setMode] = useState(isCustomValue ? "custom" : "select");

  if (!hasOptions || mode === "custom") {
    return (
      <div className="space-y-1.5">
        <Label htmlFor={id}>
          {label}
          {required && <span className="text-destructive"> *</span>}
        </Label>
        <Input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || "Digite..."}
          required={required}
          disabled={disabled}
        />
        {hasOptions && (
          <button
            type="button"
            onClick={() => {
              setMode("select");
              onChange("");
            }}
            className="text-xs text-action hover:underline"
          >
            usar lista cadastrada
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>
        {label}
        {required && <span className="text-destructive"> *</span>}
      </Label>
      <Select
        value={value}
        onValueChange={(v) => {
          if (v === "__custom__") {
            setMode("custom");
            onChange("");
          } else {
            onChange(v);
          }
        }}
        disabled={disabled}
      >
        <SelectTrigger id={id}>
          <SelectValue placeholder={placeholder || "Selecione..."} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt} value={opt}>
              {opt}
            </SelectItem>
          ))}
          <SelectItem value="__custom__">Outra / digitar...</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}