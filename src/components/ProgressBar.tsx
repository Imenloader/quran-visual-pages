import { toArabicNumber } from "@/data/quranData";

interface ProgressBarProps {
  progress: number;
  currentPage: number;
  totalPages: number;
  startPage: number;
}

const ProgressBar = ({ progress, currentPage, totalPages, startPage }: ProgressBarProps) => {
  return (
    <div className="sticky top-0 z-40">
      <div className="h-1 bg-muted w-full">
        <div
          className="h-full gradient-gold transition-all duration-300 ease-out"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
