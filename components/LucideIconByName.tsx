'use client';

import type { LucideIcon, LucideProps } from 'lucide-react';
import { DynamicIcon, iconNames, type IconName } from 'lucide-react/dynamic';

const validIconNames = new Set<string>(iconNames);

const toIconName = (name: string | null | undefined): IconName | null => {
  const normalized = name?.trim().toLowerCase();
  return normalized && validIconNames.has(normalized) ? (normalized as IconName) : null;
};

type LucideIconByNameProps = Omit<LucideProps, 'ref' | 'name'> & {
  name: string | null | undefined; // kebab-case Lucide name, e.g. "door-open", "notebook-pen"
  fallback: LucideIcon;
};

// Renders a Lucide icon from its kebab-case name; unknown or empty names render `fallback`
export function LucideIconByName({ name, fallback: Fallback, className, ...props }: LucideIconByNameProps) {
  const iconName = toIconName(name);

  if (!iconName) {
    return <Fallback className={className} {...props} />;
  }

  return (
    <DynamicIcon
      name={iconName}
      className={className}
      {...props}
      // Same-size placeholder while the icon chunk loads, to avoid layout shift
      fallback={() => <span className={`inline-block ${className ?? ''}`} />}
    />
  );
}
