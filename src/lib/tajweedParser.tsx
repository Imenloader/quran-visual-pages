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
    regex: new RegExp(`(.\u0653[\u0651\u0652])`, "g"), 
    color: "#FF0000", 
    label: "مد 6 حركات" 
  },
  { 
    name: "madd45",
    regex: new RegExp(`(.\u0653)`, "g"), 
    color: "#FF4500", 
    label: "مد 4-5 حركات" 
  },
  {
    name: "lam_jalalah",
    // Lam in Allah with Fatha/Damma before it: (Thickness)
    regex: new RegExp(`([\u064e\u064f]\\s*[\u0627][\u0644][\u0644][\u0647])`, "g"),
    color: "#E11D48",
    label: "لام لفظ الجلالة (تغليظ)"
  },
  { 
    name: "ghunnah",
    regex: new RegExp(`([\u0646\u0645]\u0651)`, "g"), 
    color: "#00A86B", 
    label: "غنة" 
  },
  { 
    name: "qalqalah",
    regex: new RegExp(`([\u0642\u0637\u0628\u062c\u062f]\u0652)`, "g"), 
    color: "#1E90FF", 
    label: "قلقلة" 
  },
  { 
    name: "iqlab",
    regex: new RegExp(`([\u0646]\u0652?\\s*[\u0628]|[\u064B\u064C\u064D]\\s*[\u0628])`, "g"), 
    color: "#20B2AA", 
    label: "إقلاب" 
  },
  { 
    name: "ikhfa",
    regex: new RegExp(`([\u0646]\u0652?\\s*[\u062a\u062b\u062c\u062f\u0630\u0632\u0633\u0634\u0635\u0636\u0637\u0638\u0641\u0642\u064a]|[\u064B\u064C\u064D]\\s*[\u062a\u062b\u062c\u062f\u0630\u0632\u0633\u0634\u0635\u0636\u0637\u0638\u0641\u0642\u064a])`, "g"), 
    color: "#FF8C00", 
    label: "إخفاء" 
  },
  { 
    name: "idgham_ghunnah",
    // Idgham with Ghunnah: Noon Sakinah or Tanween followed by (Y, N, M, W)
    regex: new RegExp(`([\u0646]\u0652?\\s*[\u064a\u0646\u0645\u0648]|[\u064B\u064C\u064D]\\s*[\u064a\u0646\u0645\u0648])`, "g"), 
    color: "#00A86B", 
    label: "إدغام بغنة" 
  },
  { 
    name: "idgham_no_ghunnah",
    // Idgham without Ghunnah: Noon Sakinah or Tanween followed by (L, R)
    regex: new RegExp(`([\u0646]\u0652?\\s*[\u0644\u0631]|[\u064B\u064C\u064D]\\s*[\u0644\u0631])`, "g"), 
    color: "#AAAAAA", 
    label: "إدغام بدون غنة" 
  },
  { 
    name: "labial_ikhfa",
    regex: new RegExp(`([\u0645][\u0652]?\\s*[\u0628])`, "g"), 
    color: "#9370DB", 
    label: "إخفاء شفوي" 
  },
  {
    name: "hamzat_wasl",
    regex: new RegExp(`(\u0671)`, "g"),
    color: "#AAAAAA",
    label: "همزة وصل"
  },
  {
    name: "silent",
    regex: new RegExp(`(.\u06DF)`, "g"),
    color: "#AAAAAA",
    label: "حرف صامت"
  },
  {
    name: "small_letters",
    // Small Alif, Waw, Ya, Noon: \u0670, \u06E5, \u06E6, \u06E7, \u06E8
    regex: new RegExp(`([\u0670\u06E5\u06E6\u06E7\u06E8])`, "g"),
    color: "#FF4500",
    label: "حروف صغيرة"
  },
  {
    name: "waqf_mandatory",
    // Mandatory Stop (Meem): \u06D8
    regex: new RegExp(`([\u06D8])`, "g"),
    color: "#E11D48",
    label: "وقف لازم"
  },
  {
    name: "waqf_prohibited",
    // Prohibited Stop (La): \u06D9
    regex: new RegExp(`([\u06D9])`, "g"),
    color: "#DC2626",
    label: "وقف ممنوع"
  },
  {
    name: "waqf_permissible",
    // Permissible Stop (Jeem): \u06DA
    regex: new RegExp(`([\u06DA])`, "g"),
    color: "#059669",
    label: "وقف جائز"
  },
  {
    name: "waqf_preferable_stop",
    // Qali: \u06D7
    regex: new RegExp(`([\u06D7])`, "g"),
    color: "#2563EB",
    label: "الوقف أولى"
  },
  {
    name: "waqf_preferable_continue",
    // Sali: \u06D6
    regex: new RegExp(`([\u06D6])`, "g"),
    color: "#7C3AED",
    label: "الوصل أولى"
  },
  {
    name: "waqf_muanaqah",
    // Mu'anaqah (Three dots): \u06DB
    regex: new RegExp(`([\u06DB])`, "g"),
    color: "#D97706",
    label: "وقف معانقة"
  },
  {
    name: "sajdah",
    // Sajdah sign: \u06E9
    regex: new RegExp(`([\u06E9])`, "g"),
    color: "#7C3AED",
    label: "سجدة"
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
