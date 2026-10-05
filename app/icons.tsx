import type { ReactNode } from "react";

/* One stroke icon set replaces the mixed Unicode arrows and symbols. */
function Icon({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <svg
      className={`icon ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

type IconProps = { className?: string };

export function ArrowIcon({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </Icon>
  );
}

export function PlusIcon({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path d="M12 5v14M5 12h14" />
    </Icon>
  );
}

export function MinusIcon({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path d="M5 12h14" />
    </Icon>
  );
}

export function CloseIcon({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path d="M6 6l12 12M18 6 6 18" />
    </Icon>
  );
}

export function PauseIcon({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path d="M9 6v12M15 6v12" />
    </Icon>
  );
}

export function TapIcon({ className }: IconProps) {
  return (
    <Icon className={className}>
      <circle cx="12" cy="15" r="2.8" fill="currentColor" stroke="none" />
      <path d="M12 4.5v3M6 7l2.1 2.1M18 7l-2.1 2.1" />
    </Icon>
  );
}

export function GlideIcon({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path d="M12 4v16M8.5 7.5 12 4l3.5 3.5M8.5 16.5 12 20l3.5-3.5" />
    </Icon>
  );
}

export function CircleIcon({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3" />
      <path d="M19.5 4.5v3.8h-3.8" />
    </Icon>
  );
}

export function HoldIcon({ className }: IconProps) {
  return (
    <Icon className={className}>
      <circle cx="12" cy="12" r="7.5" />
      <circle cx="12" cy="12" r="3" fill="currentColor" stroke="none" />
    </Icon>
  );
}

export function MusicIcon({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path d="M9 17.5V6.5l10-2v11" />
      <circle cx="6.5" cy="17.5" r="2.5" />
      <circle cx="16.5" cy="15.5" r="2.5" />
    </Icon>
  );
}

export function ReadingIcon({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path d="M5 7h14M5 12h14M5 17h9" />
    </Icon>
  );
}

export function NavigationIcon({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path d="M7 20v-6.5A4.5 4.5 0 0 1 11.5 9H19M15 5l4 4-4 4" />
    </Icon>
  );
}

export function PlayIcon({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path d="M8 5.5v13l10.5-6.5z" />
    </Icon>
  );
}

export function AppsIcon({ className }: IconProps) {
  return (
    <Icon className={className}>
      <rect x="4.5" y="4.5" width="6" height="6" rx="1.5" />
      <rect x="13.5" y="4.5" width="6" height="6" rx="1.5" />
      <rect x="4.5" y="13.5" width="6" height="6" rx="1.5" />
      <rect x="13.5" y="13.5" width="6" height="6" rx="1.5" />
    </Icon>
  );
}
