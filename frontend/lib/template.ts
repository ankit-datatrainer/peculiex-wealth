/**
 * `{token}` placeholders for CMS copy that wraps live values ("Showing
 * {shown} of {total} companies"). Unknown tokens are left as typed, so a
 * mistyped placeholder shows up on the page instead of silently vanishing.
 */
export function fill(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (m, k: string) =>
    Object.prototype.hasOwnProperty.call(vars, k) ? String(vars[k]) : m
  );
}
