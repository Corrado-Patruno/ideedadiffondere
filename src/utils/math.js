export const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export function smoothstep(edgeStart, edgeEnd, value) {
  const t = clamp((value - edgeStart) / (edgeEnd - edgeStart), 0, 1);
  return t * t * (3 - 2 * t);
}
