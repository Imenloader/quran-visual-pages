/**
 * Utility functions for user-related calculations
 */

/**
 * Calculates user level based on total points.
 * Uses a triangular number formula scaled by 5000.
 * pts = 5000 * (level-1) * level / 2
 * level = (sqrt(8 * pts / 5000 + 1) - 1) / 2 + 1
 */
export const calculateLevel = (pts: number): number => {
  if (!pts || pts <= 0) return 1;
  const lvl = Math.floor((Math.sqrt(8 * pts / 5000 + 1) - 1) / 2);
  return Math.max(1, lvl + 1);
};

/**
 * Calculates the point threshold for a specific level.
 */
export const getLevelThreshold = (lvl: number): number => {
  if (lvl <= 1) return 0;
  const l = lvl - 1;
  return 5000 * l * (l + 1) / 2;
};

/**
 * Formats a point value or level for display.
 */
export const formatUserStat = (value: number, isArabic: boolean): string => {
  const { toArabicNumber } = require("@/data/quranData");
  return isArabic ? toArabicNumber(value) : value.toLocaleString();
};
