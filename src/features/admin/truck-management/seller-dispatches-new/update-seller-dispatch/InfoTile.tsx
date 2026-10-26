import type { IconType } from "react-icons";

export type TileTone = "navy" | "blue" | "green" | "orange" | "red";

interface InfoTileProps {
  icon: IconType;
  label: string;
  value: string;
  tone: TileTone;
  /** Renders the value as a tap-to-call link. */
  phone?: boolean;
}

/** Grey tile with a coloured left border, an icon + label and a bold value. */
const InfoTile = ({ icon: Icon, label, value, tone, phone = false }: InfoTileProps) => (
  <div className={`info-tile info-tile--${tone}`}>
    <dt>
      <Icon aria-hidden className="info-tile__icon" /> {label}
    </dt>
    <dd>
      {phone ? (
        <a href={`tel:${value}`} className="info-tile__phone">
          <Icon aria-hidden /> {value}
        </a>
      ) : (
        value
      )}
    </dd>
  </div>
);

export default InfoTile;
