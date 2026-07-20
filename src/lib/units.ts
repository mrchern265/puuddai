// milestone_badge is meant to be a single emoji, but some older units store a
// long text label that would overflow the icon tile. Fall back to a default glyph.
export function unitGlyph(badge: string | null | undefined): string {
  const b = (badge ?? '').trim()
  return b && [...b].length <= 2 ? b : '📘'
}
