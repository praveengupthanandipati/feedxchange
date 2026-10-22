interface SectionHeadProps {
  /** Id for the heading, so the section can be labelled by it. */
  id: string;
  eyebrow: string;
  title: string;
  text?: string;
  align?: "center" | "left";
}

const SectionHead = ({ id, eyebrow, title, text, align = "center" }: SectionHeadProps) => (
  <div className={`section-head ${align === "left" ? "section-head--left" : ""}`}>
    <span className="eyebrow">{eyebrow}</span>
    <h2 id={id}>{title}</h2>
    {text && <p>{text}</p>}
  </div>
);

export default SectionHead;
