import { useState } from "react";
import { Link } from "react-router-dom";
import { JuzInfo, toArabicNumber, getQuranPageImageUrl } from "@/data/quranData";
import { Download, Check, Loader2 } from "lucide-react";

interface JuzCardProps {
  juz: JuzInfo;
  index: number;
}

const JuzCard = ({ juz, index }: JuzCardProps) => {
  const [downloadState, setDownloadState] = useState<"idle" | "downloading" | "done">("idle");
  const [progress, setProgress] = useState(0);

  const totalPages = juz.endPage - juz.startPage + 1;

  const downloadForOffline = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (downloadState === "downloading") return;
    setDownloadState("downloading");
    setProgress(0);

    let loaded = 0;
    const batchSize = 4;
    const pages = Array.from({ length: totalPages }, (_, i) => juz.startPage + i);

    for (let i = 0; i < pages.length; i += batchSize) {
      const batch = pages.slice(i, i + batchSize);
      await Promise.all(
        batch.map(async (page) => {
          try {
            const url = getQuranPageImageUrl(page);
            const res = await fetch(url, { cache: "force-cache" });
            if (res.ok) await res.blob();
          } catch { /* ignore */ }
          loaded++;
          setProgress(Math.round((loaded / totalPages) * 100));
        })
      );
    }

    setDownloadState("done");
    setTimeout(() => setDownloadState("idle"), 4000);
  };

  return (
    <Link
      to={`/juz/${juz.number}`}
      className="group block"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <div className="relative overflow-hidden rounded-lg border border-border bg-card p-5 transition-all duration-300 hover:shadow-islamic hover:border-gold-light hover:-translate-y-1">
        <div className="absolute top-0 left-0 w-12 h-12 gradient-gold opacity-20 rounded-br-full" />

        {/* Download button */}
        <button
          onClick={downloadForOffline}
          title="تحميل للقراءة أوفلاين"
          className={`absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center transition-all z-10 ${
            downloadState === "done"
              ? "bg-primary text-primary-foreground"
              : downloadState === "downloading"
              ? "bg-gold/20 text-gold"
              : "bg-muted text-muted-foreground hover:bg-gold/20 hover:text-gold"
          }`}
        >
          {downloadState === "downloading" ? (
            <Loader2 size={14} className="animate-spin" />
          ) : downloadState === "done" ? (
            <Check size={14} />
          ) : (
            <Download size={14} />
          )}
        </button>

        {/* Progress bar */}
        {downloadState === "downloading" && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted overflow-hidden rounded-b-lg">
            <div className="h-full gradient-gold transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        )}

        <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 rounded-full gradient-islamic">
          <span className="text-lg font-bold font-amiri text-primary-foreground">
            {toArabicNumber(juz.number)}
          </span>
        </div>

        <h3 className="text-center font-amiri text-lg font-bold text-foreground mb-1 group-hover:text-gold-dark transition-colors">
          {juz.nameAr}
        </h3>

        <p className="text-center text-sm text-muted-foreground font-naskh">
          {juz.startSurah}
        </p>

        <p className="text-center text-xs text-muted-foreground mt-2 font-naskh">
          صفحة {toArabicNumber(juz.startPage)} - {toArabicNumber(juz.endPage)}
        </p>

        {downloadState === "downloading" && (
          <p className="text-center text-[10px] text-gold font-naskh mt-1">
            جاري التحميل... {progress}%
          </p>
        )}
        {downloadState === "done" && (
          <p className="text-center text-[10px] text-primary font-naskh mt-1">
            ✓ تم التحميل للأوفلاين
          </p>
        )}
      </div>
    </Link>
  );
};

export default JuzCard;
