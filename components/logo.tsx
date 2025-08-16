import { cn } from "@/lib/utils";
import { Tile } from "./tile/tile";

export function Logo({ className, tileWidth = 24 }: { className?: string, tileWidth?: number }) {
  const backgroundClass = "bg-background";
  const foregroundClass = "bg-foreground";
  const radiusClass = `rounded`;

  return (
    <div className={cn(`flex gap-0.5`, className)}>
      {/* T */}
      <Tile data={{ tl: true, tr: true, bl: false, br: true }} maxWidth={tileWidth} backgroundClass={backgroundClass} foregroundClass={foregroundClass} radiusClass={radiusClass} />
      
      {/* I */}
      <div className={`${radiusClass} ${foregroundClass} aspect-[1/2]`} style={{
        width: `${tileWidth/2}px`,
      }}></div>

      {/* L */}
      <Tile data={{ tl: true, tr: false, bl: true, br: true }} maxWidth={tileWidth} backgroundClass={backgroundClass} foregroundClass={foregroundClass} radiusClass={radiusClass} />
      
      {/* E */}
      <Tile data={{ tl: true, tr: true, bl: true, br: true }} maxWidth={tileWidth} backgroundClass={backgroundClass} foregroundClass={foregroundClass} radiusClass={radiusClass} />
    </div>
  );
}
