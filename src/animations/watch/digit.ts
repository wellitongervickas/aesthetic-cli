import { DIGITS, DIGIT_HEIGHT } from "./constants.js";

export function renderTime(time: string): string[] {
  const chars = time.split("");
  const rows: string[] = [];

  for (let row = 0; row < DIGIT_HEIGHT; row++) {
    const line = chars
      .map((ch) => DIGITS[ch]?.[row] ?? "        ")
      .join(" ");
    rows.push(line);
  }

  return rows;
}
