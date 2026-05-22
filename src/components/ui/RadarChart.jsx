export function RadarChart({ data }) {
  const labels = ['Potência', 'Torque', 'Velocidade', 'Aceleração', 'Manuseio', 'Peso'];
  const size = 200;
  const cx = size / 2;
  const cy = size / 2;
  const r = 78;
  const levels = 4;

  const vals = [
    Math.min(100, (data.horsepower || 0) / 6),
    Math.min(100, (data.torque || 0) / 8),
    Math.min(100, (data.topSpeed || 0) / 3.5),
    Math.max(0, 100 - ((data.acceleration || 10) - 2) * 12),
    Math.min(100, parseFloat(data.trackHandlingScore || 0) * 10),
    Math.max(0, 100 - (((data.weight || 2000) - 600) / 20)),
  ].map((v) => Math.max(5, Math.min(100, v)));

  const toXY = (angle, pct, radius = r) => {
    const a = ((angle - 90) * Math.PI) / 180;
    return {
      x: cx + radius * (pct / 100) * Math.cos(a),
      y: cy + radius * (pct / 100) * Math.sin(a),
    };
  };

  const pts = vals.map((_, i) => toXY(i * 60, vals[i]));
  const poly = pts.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {[...Array(levels)].map((_, l) => {
        const lp = [...Array(6)]
          .map((_, i) => { const p = toXY(i * 60, (l + 1) * 25); return `${p.x},${p.y}`; })
          .join(' ');
        return <polygon key={l} points={lp} fill="none" stroke="#2a3044" strokeWidth="0.8" />;
      })}
      {[...Array(6)].map((_, i) => {
        const ep = toXY(i * 60, 100);
        return <line key={i} x1={cx} y1={cy} x2={ep.x} y2={ep.y} stroke="#2a3044" strokeWidth="0.8" />;
      })}
      <polygon points={poly} fill="rgba(232,98,42,0.18)" stroke="#e8622a" strokeWidth="1.5" strokeLinejoin="round" />
      {pts.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="3.5" fill="#e8622a" />)}
      {labels.map((lbl, i) => {
        const lp = toXY(i * 60, 128);
        return (
          <text key={i} x={lp.x} y={lp.y} textAnchor="middle" dominantBaseline="middle"
            fontSize="8.5" fill="#636a8a" fontFamily="Barlow,sans-serif" fontWeight="600">
            {lbl}
          </text>
        );
      })}
    </svg>
  );
}
