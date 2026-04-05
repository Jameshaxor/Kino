"use client";

import { useState, useRef } from "react";
import { Share2, Download, Check, Loader2 } from "lucide-react";

export interface ShareItem {
  title: string;
  poster_path?: string;
  year?: string | number;
}

interface ShareButtonProps {
  type: "taste" | "movie";
  items: ShareItem[];
  title?: string;
  subtitle?: string;
}

export default function ShareButton({ type, items, title, subtitle }: ShareButtonProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generateImage = async () => {
    if (!canvasRef.current) return null;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    setLoading(true);

    try {
      // Card dimensions
      const width = 1080;
      const height = type === "movie" ? 1080 : 1350; // Square for single, portrait for list

      canvas.width = width;
      canvas.height = height;

      // 1. Draw Background
      ctx.fillStyle = "#060606"; // bg-base
      ctx.fillRect(0, 0, width, height);

      // Subtle gradient
      const gradient = ctx.createRadialGradient(width, 0, 0, width, 0, width);
      gradient.addColorStop(0, "rgba(139, 92, 246, 0.15)"); // accent color
      gradient.addColorStop(1, "transparent");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // 2. Draw Branding
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 48px 'Helvetica Neue', Helvetica, sans-serif";
      ctx.fillText("KINO", 80, 100);

      ctx.fillStyle = "#8B5CF6";
      ctx.font = "bold 24px 'Courier New', monospace";
      ctx.fillText("DISCOVERY", 80, 140);

      // 3. Draw Main Text
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 64px 'Helvetica Neue', Helvetica, sans-serif";
      ctx.fillText(title || (type === "taste" ? "My Top Picks" : "Watch This"), 80, 260);

      if (subtitle) {
        ctx.fillStyle = "#a3a3a3";
        ctx.font = "32px 'Helvetica Neue', Helvetica, sans-serif";
        ctx.fillText(subtitle, 80, 320);
      }

      // 4. Draw Posters & Titles
      const loadImg = (src: string): Promise<HTMLImageElement> => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = src;
        });
      };

      if (type === "movie" && items[0]) {
        // Single Movie Layout (Left: Info, Right: Poster)
        if (items[0].poster_path) {
          try {
            const img = await loadImg(`https://image.tmdb.org/t/p/w500${items[0].poster_path}`);
            // Calculate aspect ratio 2:3
            const pWidth = 460;
            const pHeight = 690;
            
            // Draw poster with rounded corners (simulated via clipping)
            ctx.save();
            ctx.beginPath();
            ctx.roundRect(width - pWidth - 80, 200, pWidth, pHeight, 24);
            ctx.clip();
            ctx.drawImage(img, width - pWidth - 80, 200, pWidth, pHeight);
            ctx.restore();
          } catch (e) {
            console.error("Failed to load poster");
          }
        }

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 56px 'Helvetica Neue', Helvetica, sans-serif";
        const text = items[0].title;
        // Simple word wrap
        const words = text.split(" ");
        let line = "";
        let y = 450;
        for (let i = 0; i < words.length; i++) {
          const testLine = line + words[i] + " ";
          const metrics = ctx.measureText(testLine);
          if (metrics.width > 400 && i > 0) {
            ctx.fillText(line, 80, y);
            line = words[i] + " ";
            y += 70;
          } else {
            line = testLine;
          }
        }
        ctx.fillText(line, 80, y);

        if (items[0].year) {
          ctx.fillStyle = "#a3a3a3";
          ctx.font = "36px 'Courier New', monospace";
          ctx.fillText(String(items[0].year), 80, y + 60);
        }

      } else {
        // Taste Profile Layout (Grid/Row of posters)
        const maxItems = Math.min(items.length, 5);
        const pWidth = 160;
        const pHeight = 240;
        const gap = 20;
        const startX = 80;
        const startY = 400;

        for (let i = 0; i < maxItems; i++) {
          const item = items[i];
          const x = startX + i * (pWidth + gap);
          
          if (item.poster_path) {
            try {
              const img = await loadImg(`https://image.tmdb.org/t/p/w200${item.poster_path}`);
              ctx.save();
              ctx.beginPath();
              ctx.roundRect(x, startY, pWidth, pHeight, 16);
              ctx.clip();
              ctx.drawImage(img, x, startY, pWidth, pHeight);
              ctx.restore();
            } catch (e) {
              ctx.fillStyle = "#171717";
              ctx.beginPath();
              ctx.roundRect(x, startY, pWidth, pHeight, 16);
              ctx.fill();
            }
          }

          // Draw number
          ctx.fillStyle = "#ffffff";
          ctx.font = "bold 48px 'Helvetica Neue', Helvetica, sans-serif";
          ctx.fillText(String(i + 1), x + 10, startY - 20);
        }
      }

      // 5. Draw Footer URL
      ctx.fillStyle = "#a3a3a3";
      ctx.font = "24px 'Helvetica Neue', Helvetica, sans-serif";
      ctx.fillText("kinodiscovery.com", 80, height - 60);

      // Get Data URL
      return canvas.toDataURL("image/png");
    } catch (error) {
      console.error("Canvas generation failed:", error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    const dataUrl = await generateImage();
    if (!dataUrl) return;

    try {
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], 'kino-share.png', { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'Check this out on KINO',
          files: [file],
        });
      } else {
        // Fallback to download
        const a = document.createElement("a");
        a.href = dataUrl;
        a.download = "kino-share.png";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Share failed:", err);
    }
  };

  return (
    <>
      <button
        onClick={handleShare}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 bg-bg-elevated border border-border rounded-lg text-sm font-medium text-text-primary hover:border-accent hover:text-accent transition-all disabled:opacity-50"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : success ? (
          <Check className="w-4 h-4 text-green-500" />
        ) : (
          <Share2 className="w-4 h-4" />
        )}
        {success ? "Shared!" : "Share"}
      </button>
      
      {/* Hidden canvas for image generation */}
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </>
  );
}
