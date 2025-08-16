import { cn } from "@/lib/utils";

export type TileData = {
  tl: boolean;
  tr: boolean;
  bl: boolean;
  br: boolean;
};

function boolToInt(bool: boolean): number {
  return bool ? 1 : 0;
}

export function Tile({ 
  data, 
  size,
  radiusClass = "rounded-sm",
  backgroundClass = "bg-background",
  foregroundClass = "bg-foreground"
}: { 
  data: TileData, 
  size: number, 
  radiusClass?: string,
  backgroundClass?: string,
  foregroundClass?: string
}) {
  const tileCommonClasses = `${backgroundClass} ${radiusClass}`

  // Number of subtiles
  const count = boolToInt(data.tl) + boolToInt(data.tr) + boolToInt(data.bl) + boolToInt(data.br);

  const radius = {
    "tl": "",
    "tr": "",
    "bl": "",
    "br": "",
  }

  if (data.tl && data.tr) {
    radius.tl += " rounded-r-none";
    radius.tr += " rounded-l-none";
  }

  if (data.bl && data.br) {
    radius.bl += " rounded-r-none";
    radius.br += " rounded-l-none";
  }

  if (data.tl && data.bl) {
    radius.tl += " rounded-b-none";
    radius.bl += " rounded-t-none";
  }

  if (data.tr && data.br) {
    radius.tr += " rounded-b-none";
    radius.br += " rounded-t-none";
  }

  return (
    <div className={`relative w-${size} aspect-square`}>
      <div className={cn(`${tileCommonClasses} w-1/2 h-1/2 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2`, {
        [foregroundClass]: count > 2 || (data.tl && data.br) || (data.tr && data.bl)
      })}></div>
      <div className={`relative grid grid-cols-2 grid-rows-2 w-full h-full`}>
        <div className={cn(`${tileCommonClasses} ${radius.tl}`, {
          [foregroundClass]: data.tl,
        })}></div>
        <div className={cn(`${tileCommonClasses} ${radius.tr}`, {
          [foregroundClass]: data.tr,
        })}></div>
        <div className={cn(`${tileCommonClasses} ${radius.bl}`, {
          [foregroundClass]: data.bl,
        })}></div>
        <div className={cn(`${tileCommonClasses} ${radius.br}`, {
          [foregroundClass]: data.br,
        })}></div>
      </div>
    </div>
  )
}