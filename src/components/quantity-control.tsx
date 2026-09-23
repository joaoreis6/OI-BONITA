"use client";

import { useId } from "react";

export function QuantityControl({
  label,
  quantity,
  onChange,
  maximum,
  compact = false,
}: {
  label: string;
  quantity: number;
  onChange: (quantity: number) => void;
  maximum?: number;
  compact?: boolean;
}) {
  const inputId = useId();
  return (
    <div className={`quantity-control${compact ? " quantity-control-compact" : ""}`}>
      {!compact && <label htmlFor={inputId}>Quantidade</label>}
      <button type="button" aria-label={`Diminuir quantidade de ${label}`} disabled={quantity <= 1} onClick={() => onChange(Math.max(1, quantity - 1))}>−</button>
      <input
        id={inputId}
        type="number"
        min={1}
        max={maximum}
        step={1}
        inputMode="numeric"
        aria-label={`Quantidade de ${label}`}
        value={quantity}
        onChange={(event) => {
          const value = Number(event.currentTarget.value);
          if (Number.isInteger(value) && value >= 1 && (maximum === undefined || value <= maximum)) onChange(value);
        }}
      />
      <button type="button" aria-label={`Aumentar quantidade de ${label}`} disabled={maximum !== undefined && quantity >= maximum} onClick={() => onChange(maximum === undefined ? quantity + 1 : Math.min(maximum, quantity + 1))}>+</button>
    </div>
  );
}
