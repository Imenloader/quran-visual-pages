import React from "react";

interface TajweedTextProps {
  text: string;
  className?: string;
}

/**
 * A simple component to render Tajweed-colored text.
 * In a real-world app, this would use a complex parser or pre-annotated text.
 * For this guide, we'll use a simplified approach where we look for specific 
 * patterns or use a simple markup.
 */
export const TajweedText: React.FC<TajweedTextProps> = ({ text, className = "" }) => {
  // Simplified Tajweed coloring logic for demonstration in the guide
  // In a production app, this would be much more sophisticated
  
  const rules = [
    { regex: /([نمليور])ّ/g, color: "text-emerald-500", label: "Ghunnah/Idgham" }, // Shaddah on specific letters
    { regex: /([أإآؤئ])/g, color: "text-amber-500", label: "Mad/Hamza" }, // Hamza/Mad
    { regex: /([قطبجد])ْ/g, color: "text-rose-500", label: "Qalqalah" }, // Sukun on Qalqalah letters
    { regex: /([ن])ْ/g, color: "text-blue-500", label: "Ikhfa/Idgham" }, // Sukun on Noon
  ];

  // This is a very basic implementation. 
  // For the guide, we might want to just manually mark the text if it's for specific examples.
  
  return (
    <span className={`font-naskh leading-loose ${className}`}>
      {text.split(" ").map((word, i) => (
        <span key={i} className="inline-block mx-1">
          {word}
        </span>
      ))}
    </span>
  );
};
