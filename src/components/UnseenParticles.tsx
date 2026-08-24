import { useMemo } from "react";

/** Decorative glowing particle field for the "Discovering the Unseen" atmosphere. */
const UnseenParticles = ({ count = 28 }: { count?: number }) => {
  const particles = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: 40 + Math.random() * 60,
        size: 1 + Math.random() * 3,
        duration: 8 + Math.random() * 12,
        delay: Math.random() * 10,
        violet: i % 3 === 0,
      })),
    [count]
  );

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map((p) => (
        <span
          key={p.id}
          className="particle"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            background: p.violet ? "hsl(265 90% 74%)" : undefined,
            boxShadow: p.violet ? "0 0 12px hsl(265 90% 74% / .9)" : undefined,
          }}
        />
      ))}
    </div>
  );
};

export default UnseenParticles;
