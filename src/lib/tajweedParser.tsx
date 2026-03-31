import React from "react";

/**
 * A utility to parse Arabic text and apply colors based on basic Tajweed rules.
 * This is a simplified rule-based parser.
 */

export const applyTajweedColors = (text: string): React.ReactNode[] => {
  if (!text) return [];

  // Define rules with regex and colors
  // We use Unicode escape sequences for Arabic characters and diacritics
  // We include optional following diacritics to ensure the whole character is colored
  const diacritics = "[\u064B-\u0652\u0670]*";
  
  const rules = [
    { 
      // Ghunnah (Green): Noon and Meem Mushaddadah
      // نّ (\u0646\u0651), مّ (\u0645\u0651)
      regex: new RegExp(`([\u0646\u0645]\u0651${diacritics})`, "g"), 
      color: "#2ecc71", 
      label: "Ghunnah" 
    },
    { 
      // Qalqalah (Orange): Qaf, Ta, Ba, Jeem, Dal with Sukun
      // قْ (\u0642\u0652), طْ (\u0637\u0652), بْ (\u0628\u0652), جْ (\u062C\u0652), دْ (\u062F\u0652)
      regex: new RegExp(`([\u0642\u0637\u0628\u062C\u062F]\u0652${diacritics})`, "g"), 
      color: "#e67e22", 
      label: "Qalqalah" 
    },
    { 
      // Madd (Red): Madd symbol ٓ
      // ٓ (\u0653)
      regex: new RegExp(`(.\u0653${diacritics})`, "g"), 
      color: "#e74c3c", 
      label: "Madd" 
    },
    {
      // Iqlab (Blue): Noon Sakinah or Tanween followed by small Meem (\u06E2)
      regex: new RegExp(`([\u0646]\u06E2${diacritics}|[\u064B\u064C\u064D]\u06E2${diacritics})`, "g"),
      color: "#3498db",
      label: "Iqlab"
    },
    {
      // Ikhfa (Tan): Noon Sakinah or Tanween followed by Ikhfa letters
      regex: new RegExp(`([\u0646]\u0652?\\s+[\u062A\u062B\u062C\u062D\u062E\u062F\u0630\u0632\u0633\u0634\u0635\u0636\u0637\u0638\u0641\u0642\u0643])`, "g"),
      color: "#d35400",
      label: "Ikhfa"
    },
    {
      // Idgham (Grey): Noon Sakinah or Tanween followed by Yermeloon
      regex: new RegExp(`([\u0646]\u0652?\\s+[\u064A\u0631\u0645\u0644\u0648\u0646]|[\u064B\u064C\u064D]\\s+[\u064A\u0631\u0645\u0644\u0648\u0646])`, "g"),
      color: "#95a5a6",
      label: "Idgham"
    }
  ];

  let parts: (string | React.ReactNode)[] = [text];

  rules.forEach(rule => {
    const newParts: (string | React.ReactNode)[] = [];
    parts.forEach(part => {
      if (typeof part !== "string") {
        newParts.push(part);
        return;
      }

      const split = part.split(rule.regex);
      split.forEach((subPart, i) => {
        if (i % 2 === 1) {
          // Wrap the matched part in a colored span
          newParts.push(
            <span 
              key={`${rule.label}-${i}-${Math.random()}`} 
              style={{ color: rule.color }}
              title={rule.label}
            >
              {subPart}
            </span>
          );
        } else if (subPart) {
          newParts.push(subPart);
        }
      });
    });
    parts = newParts;
  });

  return parts;
};
