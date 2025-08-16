import { Tile } from "@/components/tile/tile";

export default function TileDemo() {
  const backgroundClass = "bg-blue-100";

  return (
    <div className="grid grid-cols-4 gap-8">
      {/* Single tiles */}
      <Tile data={{ tl: true, tr: false, bl: false, br: false }} size={12} backgroundClass={backgroundClass}/>
      <Tile data={{ tl: false, tr: true, bl: false, br: false }} size={12} backgroundClass={backgroundClass}/>
      <Tile data={{ tl: false, tr: false, bl: true, br: false }} size={12} backgroundClass={backgroundClass}/>
      <Tile data={{ tl: false, tr: false, bl: false, br: true }} size={12} backgroundClass={backgroundClass}/>

      {/* Each side */}
      <Tile data={{ tl: true, tr: true, bl: false, br: false }} size={12} backgroundClass={backgroundClass}/>
      <Tile data={{ tl: false, tr: false, bl: true, br: true }} size={12} backgroundClass={backgroundClass}/>
      <Tile data={{ tl: true, tr: false, bl: true, br: false }} size={12} backgroundClass={backgroundClass}/>
      <Tile data={{ tl: false, tr: true, bl: false, br: true }} size={12} backgroundClass={backgroundClass}/>


      {/* Diagonals */}
      <Tile data={{ tl: false, tr: true, bl: true, br: false }} size={12} backgroundClass={backgroundClass}/>
      <Tile data={{ tl: true, tr: false, bl: false, br: true }} size={12} backgroundClass={backgroundClass}/>

      <div></div>
      <div></div>

      {/* Three tiles */}
      <Tile data={{ tl: true, tr: true, bl: true, br: false }} size={12} backgroundClass={backgroundClass}/>
      <Tile data={{ tl: true, tr: true, bl: false, br: true }} size={12} backgroundClass={backgroundClass}/>
      <Tile data={{ tl: true, tr: false, bl: true, br: true }} size={12} backgroundClass={backgroundClass}/>
      <Tile data={{ tl: false, tr: true, bl: true, br: true }} size={12} backgroundClass={backgroundClass}/>

      {/* All tiles */}
      <Tile data={{ tl: true, tr: true, bl: true, br: true }} size={12} backgroundClass={backgroundClass}/>
    </div>
  );
}
