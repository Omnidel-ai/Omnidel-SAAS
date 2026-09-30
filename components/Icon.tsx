const P: Record<string, string> = {
  pulse: '<path d="M3 12h4l2.5-6 4 12 2.5-6H21"/>',
  velocity: '<path d="M4 17a8 8 0 1 1 16 0"/><path d="M12 17l4.5-6"/><circle cx="12" cy="17" r="1.4"/>',
  mart: '<path d="M4 9h16l-1.2 10.2a1 1 0 0 1-1 .8H6.2a1 1 0 0 1-1-.8L4 9z"/><path d="M8.5 9V7a3.5 3.5 0 0 1 7 0v2"/>',
  studio: '<rect x="3.5" y="6" width="17" height="13" rx="2.5"/><circle cx="12" cy="12.5" r="3.2"/><path d="M8.5 6l1.3-2h4.4l1.3 2"/>',
  ads: '<path d="M4 10v4a1 1 0 0 0 1 1h2l6 4V5L7 9H5a1 1 0 0 0-1 1z"/><path d="M17 9.5a3.5 3.5 0 0 1 0 5"/>',
  mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/>',
  cam: '<rect x="3.5" y="6.5" width="17" height="12" rx="2.5"/><circle cx="12" cy="12.5" r="3"/>',
  lock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  ear: '<path d="M7 9a5 5 0 0 1 10 0c0 3-3 4-3 7a3 3 0 0 1-5.5 1.6"/><path d="M10 9.5a2 2 0 0 1 4 0"/>',
  eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
  plan: '<path d="M9 6h11M9 12h11M9 18h11"/><path d="M4 6l1 1 2-2M4 12l1 1 2-2"/><circle cx="5" cy="18" r="1.2"/>',
  score: '<path d="M12 3.5l2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.8l-5.2 2.7 1-5.8-4.2-4.1 5.8-.8z"/>',
  pay: '<path d="M7 5h10M7 9h10M13 5c3 0 3 8-2 8H8l7 6"/>',
  seed: '<path d="M12 20v-8M12 12c0-4 3-7 7-7 0 4-3 7-7 7zM12 14c0-3-2.5-5.5-6-5.5 0 3.5 2.5 5.5 6 5.5z"/>',
  rocket: '<path d="M14 4c3-1 6 0 6 0s1 3 0 6l-6 6-6-6 6-6z"/><circle cx="15" cy="9" r="1.5"/><path d="M8 10l-3 1-1 3 3-1M14 16l-1 3-3 1 1-3"/>',
  send: '<path d="M4 12l16-8-6 16-2.5-6.5z"/>',
  play: '<path d="M8 5.5l11 6.5-11 6.5z" fill="currentColor"/>',
};

export type IconName = keyof typeof P;

export function Icon({ name, className, size }: { name: string; className?: string; size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: P[name] ?? "" }}
    />
  );
}

/** `**bold**` → <b>bold</b>, for short copy strings in content/site.ts. */
export function Rich({ text }: { text: string }) {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return <>{parts.map((p, i) => (i % 2 ? <b key={i}>{p}</b> : p))}</>;
}
