import type { ReactNode } from 'react';

/* Uniform panel chrome for the lab's control cards. */
export const LabPanel = ({ title, children }: { title: string; children: ReactNode }) => (
  <section className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-3">
    <h2 className="text-xs font-bold tracking-wide text-muted-foreground uppercase">{title}</h2>
    {children}
  </section>
);

export const LabToggle = ({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}) => (
  <label className="flex items-center gap-2 text-xs">
    <input
      type="checkbox"
      checked={checked}
      onChange={(event) => {
        onChange(event.target.checked);
      }}
    />
    {label}
  </label>
);
