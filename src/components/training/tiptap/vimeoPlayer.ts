/**
 * Shared Vimeo Player SDK accessor.
 *
 * Returns a Player instance for the first Vimeo iframe on the page, or null
 * if no iframe or the SDK has not loaded yet. Used by the Notes editor
 * toolbar (insert timestamp) and the TimestampNode click handler (seek + play).
 */
type VimeoPlayer = {
  getCurrentTime: () => Promise<number>;
  setCurrentTime: (seconds: number) => Promise<void>;
  play: () => Promise<void>;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type VimeoCtor = new (iframe: HTMLIFrameElement) => VimeoPlayer;

export async function getVimeoPlayer(): Promise<VimeoPlayer | null> {
  if (typeof document === "undefined") return null;
  const iframe = document.querySelector(
    "iframe[src*='vimeo']",
  ) as HTMLIFrameElement | null;
  const Player = (window as unknown as { Vimeo?: { Player: VimeoCtor } }).Vimeo
    ?.Player;
  if (!iframe || !Player) return null;
  try {
    return new Player(iframe);
  } catch {
    return null;
  }
}

export function formatTimestamp(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}
