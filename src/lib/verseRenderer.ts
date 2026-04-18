
import { toArabicNumber } from "@/data/quranData";

interface RenderOptions {
  verse: {
    text: string;
    surahName: string;
    ayahNumber: number;
  };
  translation?: string;
  theme: 'gold' | 'emerald' | 'night';
}

export async function renderVerseToBlob(options: RenderOptions): Promise<Blob | null> {
  const { verse, translation, theme } = options;
  
  // Fixed dimensions for high quality but stable memory
  const width = 1080;
  const height = 1350;
  
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) return null;

  // 1. Draw Background
  if (theme === 'gold') {
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#1a1a1a');
    grad.addColorStop(1, '#2a2a2a');
    ctx.fillStyle = grad;
  } else if (theme === 'emerald') {
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#064e3b');
    grad.addColorStop(1, '#065f46');
    ctx.fillStyle = grad;
  } else {
    ctx.fillStyle = '#000000';
  }
  ctx.fillRect(0, 0, width, height);

  // 2. Draw Border
  ctx.lineWidth = 20;
  if (theme === 'gold') ctx.strokeStyle = 'rgba(197, 160, 40, 0.3)';
  else if (theme === 'emerald') ctx.strokeStyle = 'rgba(52, 211, 153, 0.3)';
  else ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.strokeRect(40, 40, width - 80, height - 80);

  // 3. Draw Pattern (Simplified SVG pattern drawing)
  // We can draw a few decorative stars/shapes instead of the full SVG pattern for speed
  ctx.globalAlpha = 0.05;
  ctx.fillStyle = theme === 'gold' ? '#d4af37' : '#ffffff';
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 6; j++) {
      drawStar(ctx, 100 + i * 220, 100 + j * 230, 40);
    }
  }
  ctx.globalAlpha = 1.0;

  // 4. Draw Header Icon (MoonStar)
  ctx.strokeStyle = theme === 'gold' ? 'rgba(197, 160, 40, 0.4)' : 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 4;
  drawMoonStar(ctx, width / 2, 150, 40);

  // 5. Draw Quranic Text
  const textColor = theme === 'gold' ? '#c5a028' : '#ffffff';
  ctx.fillStyle = textColor;
  ctx.textAlign = 'center';
  ctx.direction = 'rtl';
  
  const textX = width / 2;
  const maxWidth = width - 200;
  const maxHeight = height - 400; // Total space for verse + translation
  
  let quranFontSize = 64;
  let transFontSize = 32;
  let wrappedVerse: string[] = [];
  let wrappedTrans: string[] = [];
  let totalHeight = 0;

  // Dynamic font sizing loop
  while (quranFontSize > 24) {
    ctx.font = `${quranFontSize}px "Amiri", "Noto Naskh Arabic", serif`;
    wrappedVerse = wrapText(ctx, verse.text, maxWidth);
    
    if (translation) {
      ctx.font = `italic ${transFontSize}px "Noto Naskh Arabic", serif`;
      wrappedTrans = wrapText(ctx, translation, maxWidth - 40);
    }

    const verseHeight = wrappedVerse.length * (quranFontSize * 1.5);
    const transHeight = translation ? wrappedTrans.length * (transFontSize * 1.5) + 40 : 0;
    totalHeight = verseHeight + transHeight;

    if (totalHeight <= maxHeight) break;
    
    quranFontSize -= 4;
    transFontSize = Math.max(20, transFontSize - 2);
  }

  let currentY = (height / 2) - (totalHeight / 2) + 50;
  if (currentY < 250) currentY = 250; // Ensure it doesn't overlap header

  // Render Verse
  ctx.font = `${quranFontSize}px "Amiri", "Noto Naskh Arabic", serif`;
  wrappedVerse.forEach(line => {
    ctx.fillText(line, textX, currentY);
    currentY += quranFontSize * 1.5;
  });

  // Render Translation
  if (translation) {
    currentY += 20;
    ctx.font = `italic ${transFontSize}px "Noto Naskh Arabic", serif`;
    ctx.globalAlpha = 0.8;
    wrappedTrans.forEach(line => {
      ctx.fillText(line, textX, currentY);
      currentY += transFontSize * 1.5;
    });
    ctx.globalAlpha = 1.0;
  }

  // 7. Draw Footer
  const footerY = height - 150;
  ctx.strokeStyle = theme === 'gold' ? 'rgba(197, 160, 40, 0.2)' : 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(width / 2 - 150, footerY - 60);
  ctx.lineTo(width / 2 + 150, footerY - 60);
  ctx.stroke();

  ctx.font = 'bold 40px "Cormorant Garamond", serif';
  ctx.fillText(`${verse.surahName} • آية ${toArabicNumber(verse.ayahNumber)}`, textX, footerY);
  
  ctx.font = 'bold 16px "Inter", sans-serif';
  ctx.letterSpacing = '6px';
  ctx.globalAlpha = 0.5;
  ctx.fillText('QURAN KAREEM APP', textX, footerY + 60);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob);
    }, 'image/png', 0.8);
  });
}

function drawStar(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    ctx.rotate(Math.PI / 4);
    ctx.lineTo(0, size);
    ctx.rotate(Math.PI / 4);
    ctx.lineTo(0, size / 2);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawMoonStar(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number) {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.stroke();
  
  // Simple moon shape
  ctx.beginPath();
  ctx.arc(x, y, radius * 0.6, -Math.PI / 2, Math.PI / 2);
  ctx.stroke();
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(' ');
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
