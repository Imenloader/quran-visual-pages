import React from "react";

/**
 * A utility to parse Arabic text and apply colors based on basic Tajweed rules.
 * This is a simplified rule-based parser.
 */

export interface TajweedRule {
  name: string;
  regex: RegExp;
  color: string;
  label: string;
}

export const rules: TajweedRule[] = [
  { 
    name: "madd6",
    // Madd 6 (Red): Madd symbol ٓ (\u0653) followed by Shaddah or Sukoon
    regex: new RegExp(`(.\u0653[\u0651\u0652])`, "g"), 
    color: "#FF0000", 
    label: "مد 6 حركات" 
  },
  { 
    name: "madd45",
    // Madd 4-5 (Orange Red): Madd symbol ٓ (\u0653)
    regex: new RegExp(`(.\u0653)`, "g"), 
    color: "#FF4500", 
    label: "مد 4-5 حركات" 
  },
  { 
    name: "ghunnah",
    // Ghunnah (Jade Green): Noon or Meem with Shaddah
    regex: new RegExp(`([\u0646\u0645]\u0651)`, "g"), 
    color: "#00A86B", 
    label: "غنة" 
  },
  { 
    name: "qalqalah",
    // Qalqalah (Dodger Blue): Qaf, Ta, Ba, Jeem, Dal with Sukoon
    regex: new RegExp(`([\u0642\u0637\u0628\u062c\u062f]\u0652)`, "g"), 
    color: "#1E90FF", 
    label: "قلقلة" 
  },
  { 
    name: "iqlab",
    // Iqlab (Light Sea Green): Noon Sakinah or Tanween followed by Ba
    regex: new RegExp(`([\u0646]\u0652?\\s*[\u0628]|[\u064B\u064C\u064D]\\s*[\u0628])`, "g"), 
    color: "#20B2AA", 
    label: "إقلاب" 
  },
  { 
    name: "ikhfa",
    // Ikhfa (Dark Orange): Noon Sakinah or Tanween followed by Ikhfa letters
    regex: new RegExp(`([\u0646]\u0652?\\s*[\u062a\u062b\u062c\u062f\u0630\u0632\u0633\u0634\u0635\u0636\u0637\u0638\u0641\u0642\u064a]|[\u064B\u064C\u064D]\\s*[\u062a\u062b\u062c\u062f\u0630\u0632\u0633\u0634\u0635\u0636\u0637\u0638\u0641\u0642\u064a])`, "g"), 
    color: "#FF8C00", 
    label: "إخفاء" 
  },
  { 
    name: "idgham",
    // Idgham (Dark Grey): Noon Sakinah or Tanween followed by Idgham letters (Yarmaloon)
    regex: new RegExp(`([\u0646]\u0652?\\s*[\u064a\u0631\u0645\u0644\u0648\u0646]|[\u064B\u064C\u064D]\\s*[\u064a\u0631\u0645\u0644\u0648\u0646])`, "g"), 
    color: "#A9A9A9", 
    label: "إدغام" 
  },
  { 
    name: "labial_ikhfa",
    // Labial Ikhfa (Purple): Meem Sakinah followed by Ba
    regex: new RegExp(`([\u0645][\u0652]?\\s*[\u0628])`, "g"), 
    color: "#9370DB", 
    label: "إخفاء شفوي" 
  }
];

export const applyTajweedColors = (text: string): React.ReactNode[] => {
  if (!text) return [];

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
              key={`${rule.name}-${i}-${Math.random()}`} 
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
