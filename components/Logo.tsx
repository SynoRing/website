// Three vertical bars — the SynoRing brand mark.
// Inspired by the etched columns on the actual ring's facet.
type Props = { className?: string; barClassName?: string };

export function LogoMark({ className = "", barClassName = "" }: Props) {
  return (
    <span className={`inline-flex gap-[2px] items-center ${className}`}>
      <span className={`block w-[3px] h-[14px] bg-current ${barClassName}`} />
      <span className={`block w-[3px] h-[14px] bg-current ${barClassName}`} />
      <span className={`block w-[3px] h-[14px] bg-current ${barClassName}`} />
    </span>
  );
}
