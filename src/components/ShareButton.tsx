import { Share2 } from "lucide-react";
import { toArabicNumber } from "@/data/quranData";
import { useState } from "react";

interface ShareButtonProps {
  juzNumber: number;
  currentPage: number;
}

const ShareButton = ({ juzNumber, currentPage }: ShareButtonProps) => {
  const [showMenu, setShowMenu] = useState(false);

  const [isSharing, setIsSharing] = useState(false);

  const getShareUrl = () => {
    const base = window.location.origin;
    return `${base}/juz/${juzNumber}#page-${currentPage}`;
  };

  const shareText = `القرآن الكريم - الجزء ${toArabicNumber(juzNumber)} - صفحة ${toArabicNumber(currentPage)}`;

  const handleNativeShare = async () => {
    if (isSharing) return;
    const url = getShareUrl();
    if (navigator.share) {
      setIsSharing(true);
      try {
        await navigator.share({ title: shareText, url });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error("Share failed:", err);
        }
      } finally {
        setIsSharing(false);
      }
    } else {
      setShowMenu((v) => !v);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(getShareUrl());
    setShowMenu(false);
  };

  const shareWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText + "\n" + getShareUrl())}`, "_blank");
    setShowMenu(false);
  };

  const shareTelegram = () => {
    window.open(`https://t.me/share/url?url=${encodeURIComponent(getShareUrl())}&text=${encodeURIComponent(shareText)}`, "_blank");
    setShowMenu(false);
  };

  const shareTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(getShareUrl())}`, "_blank");
    setShowMenu(false);
  };

  return (
    <div className="relative">
      <button
        onClick={handleNativeShare}
        className="toolbar-btn"
        title="مشاركة الصفحة"
      >
        <Share2 size={18} />
      </button>

      {showMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
          <div className="absolute left-0 top-full mt-1 z-50 bg-card border border-border rounded-lg shadow-lg p-2 min-w-[160px] animate-fade-in">
            <button onClick={copyLink} className="w-full text-right px-3 py-2 text-sm font-naskh hover:bg-muted rounded-md transition-colors">
              📋 نسخ الرابط
            </button>
            <button onClick={shareWhatsApp} className="w-full text-right px-3 py-2 text-sm font-naskh hover:bg-muted rounded-md transition-colors">
              💬 واتساب
            </button>
            <button onClick={shareTelegram} className="w-full text-right px-3 py-2 text-sm font-naskh hover:bg-muted rounded-md transition-colors">
              ✈️ تيليجرام
            </button>
            <button onClick={shareTwitter} className="w-full text-right px-3 py-2 text-sm font-naskh hover:bg-muted rounded-md transition-colors">
              🐦 تويتر
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ShareButton;
