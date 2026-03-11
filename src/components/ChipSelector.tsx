interface ChipSelectorProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  multiple?: boolean;
}

const ChipSelector = ({ options, value, onChange }: ChipSelectorProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
            value === option
              ? "bg-chip-active text-chip-active-foreground border-chip-active"
              : "bg-chip text-chip-foreground border-border hover:border-primary/50"
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  );
};

export default ChipSelector;
