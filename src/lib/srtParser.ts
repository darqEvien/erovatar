export interface SubtitleBlock {
  index: number;
  startTime: number; // in seconds
  endTime: number;   // in seconds
  text: string;
}

// "00:01:23,450" -> 83.45
function timeToSeconds(timeStr: string): number {
  const parts = timeStr.trim().split(':');
  if (parts.length < 3) return 0;
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  const secondsParts = parts[2].split(/[,.]/);
  const seconds = parseInt(secondsParts[0], 10);
  const milliseconds = secondsParts.length > 1 ? parseInt(secondsParts[1], 10) : 0;
  return hours * 3600 + minutes * 60 + seconds + milliseconds / 1000;
}

export function parseSrt(srtContent: string): SubtitleBlock[] {
  // Normalize line endings
  const normalized = srtContent.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const blocks = normalized.split(/\n\n+/);
  
  const parsedBlocks: SubtitleBlock[] = [];
  
  for (const block of blocks) {
    const lines = block.split('\n');
    if (lines.length >= 3) {
      const indexStr = lines[0].trim();
      const timeLine = lines[1];
      const text = lines.slice(2).join('\n');
      
      // timeLine format: "00:00:01,000 --> 00:00:03,500"
      const timeMatch = timeLine.match(/(\d{2}:\d{2}:\d{2}[,.]\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}[,.]\d{3})/);
      if (timeMatch) {
        parsedBlocks.push({
          index: parseInt(indexStr, 10),
          startTime: timeToSeconds(timeMatch[1]),
          endTime: timeToSeconds(timeMatch[2]),
          text: text
        });
      }
    }
  }
  
  return parsedBlocks.sort((a, b) => a.startTime - b.startTime);
}

export function srtToVttBlob(srtContent: string): string {
  let vtt = "WEBVTT\n\n";
  const normalized = srtContent.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const blocks = normalized.split(/\n\n+/);
  
  for (const block of blocks) {
    if (!block.trim()) continue;
    const lines = block.split('\n');
    if (lines.length >= 3) {
      // replace comma with dot for VTT times
      const timeLine = lines[1].replace(/,/g, '.');
      vtt += lines[0] + "\n" + timeLine + "\n" + lines.slice(2).join('\n') + "\n\n";
    }
  }
  
  const blob = new Blob([vtt], { type: 'text/vtt' });
  return URL.createObjectURL(blob);
}

export function detectIntroGap(blocks: SubtitleBlock[]): { start: number, end: number } | null {
  if (blocks.length === 0) return null;

  // Sopranos intro is exactly ~86 seconds.
  // We search the first 10 minutes (600s) for the largest gap > 75 seconds.
  let bestGap = 0;
  let introStart = -1;
  let introEnd = -1;

  // Pilot bölüm durumu: Eğer ilk altyazı 75 saniyeden geç başlıyorsa intro en baştadır!
  if (blocks[0].startTime > 75) {
    bestGap = blocks[0].startTime;
    introStart = 0;
    introEnd = blocks[0].startTime;
  }

  for (let i = 0; i < blocks.length - 1; i++) {
    const current = blocks[i];
    const next = blocks[i + 1];
    
    // Sadece ilk 10 dakika (600s) içindeki boşluklara bak
    if (next.startTime < 600) {
      const gap = next.startTime - current.endTime;
      if (gap > bestGap && gap > 75 && gap < 160) {
        bestGap = gap;
        introStart = current.endTime;
        introEnd = next.startTime;
      }
    }
  }

  if (introStart !== -1 && introEnd !== -1) {
    return { start: introStart, end: introEnd };
  }
  return null;
}

export function detectOutroSkip(blocks: SubtitleBlock[]): number | null {
  if (blocks.length === 0) return null;
  
  // Dizinin son cümlesi tespit ediliyor.
  // Jenerik sonrası izole çevirmen notlarını atlamak için 30 saniyelik boşluk taraması.
  let lastValidEnd = blocks[blocks.length - 1].endTime;
  for (let i = blocks.length - 1; i > 0; i--) {
    const current = blocks[i];
    const previous = blocks[i - 1];
    if (current.startTime - previous.endTime > 30) {
      lastValidEnd = previous.endTime;
    } else {
      break;
    }
  }
  return lastValidEnd;
}
