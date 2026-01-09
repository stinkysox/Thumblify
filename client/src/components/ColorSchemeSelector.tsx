import React from "react";
import { colorSchemes } from "../assets/assets";

const ColorSchemeSelector = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (id: string) => void;
}) => {
  const selectedScheme = colorSchemes.find((s) => s.id === value);

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-zinc-200">
        Color Scheme
      </label>

      <div className="grid grid-cols-6 gap-3">
        {colorSchemes.map((scheme) => (
          <button
            key={scheme.id}
            onClick={() => onChange(scheme.id)}
            title={scheme.name}
            className={`relative rounded-lg transition-all ${
              value === scheme.id ? "ring-2 ring-pink-500" : ""
            }`}
          >
            <div className="flex h-10 overflow-hidden rounded-lg">
              {scheme.colors.map((color, index) => (
                <div
                  key={index}
                  className="flex-1"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </button>
        ))}
      </div>

      <p className="text-xs text-zinc-400">
        Selected: <span className="text-zinc-200">{selectedScheme?.name}</span>
      </p>
    </div>
  );
};

export default ColorSchemeSelector;
