export function Sk({ h = 16, w = '100%', mb = 8 }) {
  return <div className="skeleton" style={{ height: h, width: w, marginBottom: mb }} />;
}

export function Spinner({ size = 20 }) {
  return <span className="spinner" style={{ width: size, height: size }} />;
}

export function PageSkeleton() {
  return (
    <div className="fade-in">
      <Sk h={36} w={220} mb={8} />
      <Sk h={16} w={340} mb={28} />
      <div className="grid-4" style={{ marginBottom: 24 }}>
        {[...Array(4)].map((_, i) => <Sk key={i} h={96} />)}
      </div>
      <Sk h={240} />
    </div>
  );
}
