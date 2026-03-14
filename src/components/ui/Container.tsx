interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "section" | "article";
}

export function Container({
  children,
  className = "",
  as: Tag = "div",
}: ContainerProps) {
  return (
    <Tag className={`mx-auto max-w-[1180px] px-14 max-lg:px-7 ${className}`}>
      {children}
    </Tag>
  );
}
