import type { ReactNode } from 'react';
import { Clock } from 'lucide-react';

// ── Zaman damgası formatı ─────────────────────────────────────────────────────
// Yorum metninin içinde "@12:53" ya da "@1:02:15" (saat:dakika:saniye) gibi
// kalıpları yakalıyoruz. Kullanıcıların ayrıca "@12.53" gibi nokta ile de
// yazabilmesi için ":" ve "." ikisini de ayraç olarak kabul ediyoruz.
const TIMESTAMP_REGEX = /@(\d{1,2}(?:[:.]\d{2}){1,2})\b/g;

/** "12:53" veya "1:02:15" gibi bir zaman damgasını saniyeye çevirir. */
export function parseTimestampToSeconds(raw: string): number {
  const parts = raw.split(/[:.]/).map((p) => parseInt(p, 10));
  if (parts.some((n) => Number.isNaN(n))) return 0;
  if (parts.length === 3) {
    const [h, m, s] = parts;
    return h * 3600 + m * 60 + s;
  }
  const [m, s] = parts;
  return m * 60 + s;
}

/** Saniyeyi yorum metnine eklenebilecek "@mm:ss" (veya saat varsa "@h:mm:ss") etiketine çevirir. */
export function formatSecondsAsTag(totalSecondsInput: number): string {
  const totalSeconds = Math.max(0, Math.floor(totalSecondsInput || 0));
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const ss = String(s).padStart(2, '0');
  if (h > 0) {
    const mm = String(m).padStart(2, '0');
    return `@${h}:${mm}:${ss}`;
  }
  return `@${m}:${ss}`;
}

/**
 * Yorum metnini parçalara ayırır; içindeki zaman damgalarını tıklanabilir bir
 * "chip" olarak render eder, geri kalanını düz metin olarak bırakır.
 * `onSeek` verilmezse chip yine görünür ama tıklanamaz (disabled gibi davranır).
 */
export function renderTextWithTimestamps(
  text: string,
  onSeek?: (seconds: number) => void
): ReactNode {
  if (!text) return text;

  const regex = new RegExp(TIMESTAMP_REGEX);
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }
    const raw = match[1];
    const seconds = parseTimestampToSeconds(raw);
    nodes.push(
      <button
        key={`ts-${key++}`}
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onSeek?.(seconds);
        }}
        disabled={!onSeek}
        className="inline-flex items-center gap-1 mx-0.5 px-1.5 py-0.5 rounded-md align-baseline text-[11px] font-bold transition-colors disabled:cursor-default"
        style={{
          background: 'rgba(74,158,202,0.14)',
          color: 'var(--water-light)',
          border: '1px solid rgba(74,158,202,0.3)',
        }}
        onMouseEnter={(e) => { if (onSeek) e.currentTarget.style.background = 'rgba(74,158,202,0.28)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(74,158,202,0.14)'; }}
        title={onSeek ? `${raw} — bölümde bu ana git` : raw}
      >
        <Clock size={11} />
        {raw}
      </button>
    );
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return nodes;
}
