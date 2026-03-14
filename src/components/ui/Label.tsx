interface LabelProps {
  children: React.ReactNode;
  className?: string;
  as?: "span" | "p";
}

export function Label({ children, className = "", as: Tag = "span" }: LabelProps) {
  return (
    <Tag
      className={`block font-body text-[10.5px] font-medium tracking-[0.22em] uppercase text-copper ${className}`}
    >
      {children}
    </Tag>
  );
}
