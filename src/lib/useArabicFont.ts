import { useLanguage } from "./language-context";

export function useArabicFont() {
  const { script } = useLanguage();
  return script === "naskh" ? "font-arabic-naskh" : "font-arabic";
}
