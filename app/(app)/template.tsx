/**
 * Template (nie layout) montuje się od nowa przy każdej nawigacji, więc każdy
 * ekran wchodzi krótką animacją "boot" (wyłączaną przy prefers-reduced-motion).
 */
export default function AppTemplate({ children }: { children: React.ReactNode }) {
  return <div className="boot-in">{children}</div>;
}
