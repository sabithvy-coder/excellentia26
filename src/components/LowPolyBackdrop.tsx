import { useMemo } from "react";

/**
 * Animated low-poly triangle mesh used as the site-wide backdrop.
 * Pure SVG — deterministic mesh, gently drifting facets.
 */
const COLS = 10;
const ROWS = 7;

type Tri = { points: string; fill: string; delay: number; dur: number };

const LowPolyBackdrop = ({ className = "" }: { className?: string }) => {
  const triangles = useMemo<Tri[]>(() => {
    const w = 100 / COLS;
    const h = 100 / ROWS;
    // deterministic pseudo-random
    const rnd = (i: number) => {
      const x = Math.sin(i * 127.1) * 43758.5453;
      return x - Math.floor(x);
    };

    const palette = [
      "hsl(248 60% 18% / 0.55)",
      "hsl(245 42% 12% / 0.6)",
      "hsl(265 90% 64% / 0.10)",
      "hsl(187 95% 56% / 0.08)",
      "hsl(240 48% 7% / 0.7)",
      "hsl(224 80% 60% / 0.09)",
    ];

    const out: Tri[] = [];
    let n = 0;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const jx = (v: number) => v + (rnd(n++) - 0.5) * w * 0.6;
        const jy = (v: number) => v + (rnd(n++) - 0.5) * h * 0.6;
        const x0 = c * w;
        const y0 = r * h;
        const x1 = x0 + w;
        const y1 = y0 + h;
        const a = `${jx(x0)},${jy(y0)}`;
        const b = `${jx(x1)},${jy(y0)}`;
        const cPt = `${jx(x0)},${jy(y1)}`;
        const d = `${jx(x1)},${jy(y1)}`;
        out.push({
          points: `${a} ${b} ${cPt}`,
          fill: palette[Math.floor(rnd(n++) * palette.length)],
          delay: rnd(n++) * 8,
          dur: 9 + rnd(n++) * 10,
        });
        out.push({
          points: `${b} ${d} ${cPt}`,
          fill: palette[Math.floor(rnd(n++) * palette.length)],
          delay: rnd(n++) * 8,
          dur: 9 + rnd(n++) * 10,
        });
      }
    }
    return out;
  }, []);

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      <svg
        className="w-full h-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        shapeRendering="crispEdges"
      >
        {triangles.map((t, i) => (
          <polygon
            key={i}
            points={t.points}
            fill={t.fill}
            className="poly-facet"
            style={{ animationDelay: `${t.delay}s`, animationDuration: `${t.dur}s` }}
          />
        ))}
      </svg>
    </div>
  );
};

export default LowPolyBackdrop;
