import { Ornament } from "@/components/Decor";

// One heading style for every section: centred gold title + the same ornament.
export default function SectionHeading({ title, className = "" }: { title: string; className?: string }) {
  return (
    <div className={`text-center ${className}`}>
      <h2 className="gold-text title-lg font-display text-[2.5rem] uppercase leading-tight sm:text-6xl">{title}</h2>
      <Ornament className="mt-4" />
    </div>
  );
}
