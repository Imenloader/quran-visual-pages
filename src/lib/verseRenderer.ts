
import { toArabicNumber } from "@/data/quranData";

interface RenderOptions {
  verse: {
    text: string;
    surahName: string;
    ayahNumber: number;
  };
  translation?: string;
  theme: 'gold' | 'emerald' | 'night' | 'rose' | 'ocean';
  layout: 'square' | 'story';
}

const FONTS = [
  'Amiri',
  'Noto Naskh Arabic',
  'Cormorant Garamond',
  'Inter'
];

export async function renderVerseToBlob(options: RenderOptions): Promise<Blob | null> {
  const { verse, translation, theme, layout } = options;
  
  // Dimensions based on layout
  const width = 1080;
  const height = layout === 'square' ? 1080 : 1920;
  
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) return null;

  // Ensure fonts are loaded
  try {
    if (document.fonts) {
      await Promise.all(FONTS.map(f => document.fonts.load(`1em "${f}"`)));
      await document.fonts.ready;
    }
  } catch (e) {
    console.warn("Font loading issue:", e);
  }

  // 1. Draw Background
  const themes = {
    gold: { bg: ['#1a1a1a', '#2a2a2a'], text: '#c5a028', border: 'rgba(197, 160, 40, 0.3)', accent: '#d4af37' },
    emerald: { bg: ['#064e3b', '#065f46'], text: '#ecfdf5', border: 'rgba(52, 211, 153, 0.3)', accent: '#ffffff' },
    night: { bg: ['#000000', '#1a1a1a'], text: '#ffffff', border: 'rgba(255, 255, 255, 0.1)', accent: '#ffffff' },
    rose: { bg: ['#4c0519', '#831843'], text: '#fff1f2', border: 'rgba(251, 113, 133, 0.3)', accent: '#ffffff' },
    ocean: { bg: ['#0c4a6e', '#075985'], text: '#f0f9ff', border: 'rgba(56, 189, 248, 0.3)', accent: '#ffffff' }
  };

  const t = themes[theme] || themes.gold;
  
  const grad = ctx.createLinearGradient(0, 0, width, height);
  grad.addColorStop(0, t.bg[0]);
  grad.addColorStop(1, t.bg[1]);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // 2. Draw Pattern (Islamic Geometry)
  ctx.globalAlpha = 0.07;
  ctx.fillStyle = t.accent;
  const patternSize = 250;
  for (let i = 0; i <= width / patternSize + 1; i++) {
    for (let j = 0; j <= height / patternSize + 1; j++) {
      drawIslamicPattern(ctx, i * patternSize, j * patternSize, 60);
    }
  }
  ctx.globalAlpha = 1.0;

  // 3. Draw Border
  ctx.lineWidth = 24;
  ctx.strokeStyle = t.border;
  ctx.strokeRect(40, 40, width - 80, height - 80);
  
  // Decorative corners
  ctx.lineWidth = 4;
  ctx.strokeStyle = t.text;
  ctx.globalAlpha = 0.5;
  const cornerSize = 100;
  // Top-left
  ctx.beginPath(); ctx.moveTo(40, 40 + cornerSize); ctx.lineTo(40, 40); ctx.lineTo(40 + cornerSize, 40); ctx.stroke();
  // Top-right
  ctx.beginPath(); ctx.moveTo(width - 40 - cornerSize, 40); ctx.lineTo(width - 40, 40); ctx.lineTo(width - 40, 40 + cornerSize); ctx.stroke();
  // Bottom-left
  ctx.beginPath(); ctx.moveTo(40, height - 40 - cornerSize); ctx.lineTo(40, height - 40); ctx.lineTo(40 + cornerSize, height - 40); ctx.stroke();
  // Bottom-right
  ctx.beginPath(); ctx.moveTo(width - 40 - cornerSize, height - 40); ctx.lineTo(width - 40, height - 40); ctx.lineTo(width - 40, height - 40 - cornerSize); ctx.stroke();
  ctx.globalAlpha = 1.0;

  // 4. Draw Header Icon
  ctx.strokeStyle = t.text;
  ctx.globalAlpha = 0.6;
  ctx.lineWidth = 3;
  drawMoonStar(ctx, width / 2, layout === 'story' ? 250 : 200, 50);
  ctx.globalAlpha = 1.0;

  // 5. Text Rendering Logic
  ctx.fillStyle = t.text;
  ctx.textAlign = 'center';
  ctx.direction = 'rtl';
  
  const textX = width / 2;
  const maxWidth = width - 240;
  const maxHeight = height - (layout === 'story' ? 700 : 500);
  
  let quranFontSize = layout === 'story' ? 82 : 72;
  let transFontSize = Math.floor(quranFontSize * 0.5);
  let wrappedVerse: string[] = [];
  let wrappedTrans: string[] = [];
  let totalHeight = 0;

  // Optimized binary-search-like sizing or just a smart loop
  while (quranFontSize > 24) {
    ctx.font = `${quranFontSize}px "Amiri", "Noto Naskh Arabic", serif`;
    wrappedVerse = wrapText(ctx, verse.text, maxWidth);
    
    if (translation) {
      ctx.font = `italic ${transFontSize}px "Noto Naskh Arabic", serif`;
      wrappedTrans = wrapText(ctx, translation, maxWidth - 60);
    }

    const verseHeight = wrappedVerse.length * (quranFontSize * 1.6);
    const transHeight = translation ? (wrappedTrans.length * (transFontSize * 1.6)) + 60 : 0;
    totalHeight = verseHeight + transHeight;

    if (totalHeight <= maxHeight) break;
    
    quranFontSize -= 4;
    transFontSize = Math.max(22, Math.floor(quranFontSize * 0.5));
  }

  let currentY = (height / 2) - (totalHeight / 2) + (layout === 'story' ? 50 : 20);

  // 6. Render Verse
  ctx.font = `${quranFontSize}px "Amiri", "Noto Naskh Arabic", serif`;
  ctx.shadowColor = 'rgba(0,0,0,0.3)';
  ctx.shadowBlur = 10;
  wrappedVerse.forEach(line => {
    ctx.fillText(line, textX, currentY);
    currentY += quranFontSize * 1.6;
  });
  ctx.shadowBlur = 0;

  // 7. Render Translation
  if (translation) {
    currentY += 30;
    ctx.font = `italic ${transFontSize}px "Noto Naskh Arabic", serif`;
    ctx.globalAlpha = 0.85;
    wrappedTrans.forEach(line => {
      ctx.fillText(line, textX, currentY);
      currentY += transFontSize * 1.6;
    });
    ctx.globalAlpha = 1.0;
  }

  // 8. Draw Footer
  const footerY = height - (layout === 'story' ? 250 : 180);
  
  // Footer Line
  ctx.strokeStyle = t.text;
  ctx.globalAlpha = 0.3;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(width / 2 - 120, footerY - 70);
  ctx.lineTo(width / 2 + 120, footerY - 70);
  ctx.stroke();

  // Surah Info
  ctx.globalAlpha = 1.0;
  ctx.font = 'bold 44px "Cormorant Garamond", serif';
  ctx.fillText(`${verse.surahName} • آية ${toArabicNumber(verse.ayahNumber)}`, textX, footerY);
  
  // App Branding
  ctx.font = 'bold 18px "Inter", sans-serif';
  ctx.letterSpacing = '8px';
  ctx.globalAlpha = 0.4;
  ctx.fillText('QURAANIAT APP', textX, footerY + 70);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob);
    }, 'image/png', 0.9);
  });
}

function drawIslamicPattern(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    ctx.rotate(Math.PI / 4);
    ctx.moveTo(0, 0);
    ctx.lineTo(size, size);
    ctx.moveTo(size, 0);
    ctx.lineTo(0, size);
  }
  ctx.stroke();
  ctx.restore();
}

function drawMoonStar(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number) {
  ctx.save();
  ctx.translate(x, y);
  
  // Outer circle
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.stroke();
  
  // Inner moon
  ctx.beginPath();
  ctx.arc(radius * 0.2, 0, radius * 0.7, 0.8 * Math.PI, 1.2 * Math.PI, true);
  ctx.arc(0, 0, radius * 0.7, 1.2 * Math.PI, 0.8 * Math.PI);
  ctx.closePath();
  ctx.stroke();
  
  // Small star
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const angle = (i * 0.8 * Math.PI) - Math.PI / 2;
    const px = Math.cos(angle) * (radius * 0.3);
    const py = Math.sin(angle) * (radius * 0.3);
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
  
  ctx.restore();
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const trimmedText = text?.trim() || "";
  if (!trimmedText) return [];
  
  const words = trimmedText.split(/\s+/);
  const lines: string[] = [];
  let currentLine = words[0];

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const width = ctx.measureText(currentLine + ' ' + word).width;
    if (width < maxWidth) {
      currentLine += ' ' + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  lines.push(currentLine);
  return lines;
}
