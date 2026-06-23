/**
 * Image overlay utility for adding text to images using Canvas
 */

export interface TextOverlayOptions {
  text: string[];
  fontSize?: number;
  fontFamily?: string;
  textColor?: string;
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  backgroundOpacity?: number;
  backgroundColor?: string;
  padding?: number;
  position?: 'bottom' | 'top' | 'center';
  alignment?: 'left' | 'center' | 'right';
}

/**
 * Creates a canvas-based image with text overlay
 */
export async function createImageWithOverlay(
  imageSrc: string,
  options: TextOverlayOptions
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Could not get canvas context');

        // Draw the image
        ctx.drawImage(img, 0, 0);

        // Set up text options
        const fontSize = options.fontSize || 32;
        const fontFamily = options.fontFamily || 'Arial, sans-serif';
        const textColor = options.textColor || '#FFFFFF';
        const shadowColor = options.shadowColor || 'rgba(0, 0, 0, 0.8)';
        const shadowBlur = options.shadowBlur || 4;
        const shadowOffsetX = options.shadowOffsetX || 2;
        const shadowOffsetY = options.shadowOffsetY || 2;
        const padding = options.padding || 20;
        const position = options.position || 'bottom';
        const alignment = options.alignment || 'center';
        const backgroundColor = options.backgroundColor || 'rgba(0, 0, 0, 0.4)';

        ctx.font = `${fontSize}px ${fontFamily}`;
        ctx.textAlign = alignment as CanvasTextAlign;
        ctx.fillStyle = textColor;
        ctx.shadowColor = shadowColor;
        ctx.shadowBlur = shadowBlur;
        ctx.shadowOffsetX = shadowOffsetX;
        ctx.shadowOffsetY = shadowOffsetY;

        // Calculate text dimensions
        const textMetrics = options.text.map(line => ({
          text: line,
          width: ctx.measureText(line).width,
        }));

        const maxWidth = Math.max(...textMetrics.map(m => m.width));
        const lineHeight = fontSize * 1.2;
        const totalHeight = options.text.length * lineHeight + padding * 2;

        // Position calculations
        let startY: number;
        const rectX =
          alignment === 'center'
            ? canvas.width / 2 - maxWidth / 2 - padding
            : alignment === 'right'
              ? canvas.width - maxWidth - padding * 2
              : padding;

        if (position === 'bottom') {
          startY = canvas.height - totalHeight;
        } else if (position === 'top') {
          startY = 0;
        } else {
          startY = canvas.height / 2 - totalHeight / 2;
        }

        // Draw semi-transparent background
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(
          rectX,
          startY,
          maxWidth + padding * 2,
          totalHeight
        );

        // Draw text
        ctx.fillStyle = textColor;
        ctx.shadowColor = shadowColor;
        options.text.forEach((line, index) => {
          const x =
            alignment === 'center'
              ? canvas.width / 2
              : alignment === 'right'
                ? canvas.width - padding
                : padding;
          const y = startY + padding + fontSize * 0.7 + index * lineHeight;
          ctx.fillText(line, x, y);
        });

        // Convert canvas to blob URL
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            resolve(url);
          } else {
            reject(new Error('Failed to create blob from canvas'));
          }
        }, 'image/png', 0.95);
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error(`Failed to load image: ${imageSrc}`));
    };

    img.src = imageSrc;
  });
}

/**
 * Create episode thumbnail with text overlay
 */
export async function createEpisodeThumbnailWithText(
  imageSrc: string,
  episodeTitle: string,
  seasonNumber: number,
  episodeNumber: number
): Promise<string> {
  return createImageWithOverlay(imageSrc, {
    text: [
      episodeTitle,
      `Season ${seasonNumber} • Episode ${episodeNumber}`,
    ],
    fontSize: 28,
    fontFamily: 'Arial, sans-serif',
    textColor: '#FFFFFF',
    shadowColor: 'rgba(0, 0, 0, 0.9)',
    shadowBlur: 6,
    shadowOffsetX: 2,
    shadowOffsetY: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 16,
    position: 'bottom',
    alignment: 'center',
  });
}

/**
 * Create profile picture with character name
 */
export async function createProfilePictureWithName(
  imageSrc: string,
  characterName: string
): Promise<string> {
  return createImageWithOverlay(imageSrc, {
    text: [characterName],
    fontSize: 24,
    fontFamily: 'Arial, sans-serif',
    textColor: '#FFFFFF',
    shadowColor: 'rgba(0, 0, 0, 0.95)',
    shadowBlur: 8,
    shadowOffsetX: 2,
    shadowOffsetY: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 12,
    position: 'bottom',
    alignment: 'center',
  });
}

/**
 * Format character name from filename
 * e.g., "Aang_at_Jasmine_Dragon.webp" -> "Aang at Jasmine Dragon"
 */
export function formatCharacterName(filename: string): string {
  return filename
    .replace(/\.[^.]+$/, '') // Remove extension
    .replace(/_/g, ' ') // Replace underscores with spaces
    .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize first letter of each word
}
