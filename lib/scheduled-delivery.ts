/** Best-effort parse of "kal subah", "tomorrow morning" → scheduled ISO (Asia/Kolkata–biased). */
export function parseScheduledDeliveryHint(text: string): string | null {
  const t = text.toLowerCase();
  const hasTomorrow = /\b(kal|कल|કાલે|tomorrow|agle din|अगले)\b/i.test(text);
  const hasMorning = /\b(subah|सुबह|સવારे|morning)\b/i.test(text);
  const hasEvening = /\b(sham|शाम|સાંજ|evening)\b/i.test(text);

  if (!hasTomorrow && !hasMorning && !hasEvening) return null;

  const now = new Date();
  let days = 0;
  if (hasTomorrow) days = 1;
  else if (hasMorning || hasEvening) days = 0;

  const target = new Date(now);
  target.setDate(target.getDate() + days);
  if (hasEvening) {
    target.setHours(18, 0, 0, 0);
  } else {
    target.setHours(9, 0, 0, 0);
  }
  return target.toISOString();
}
