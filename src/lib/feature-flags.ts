export const ENABLE_LOCALIZED_LANGUAGES = false;
export const DEFAULT_LANG = "en";
export const SUPPORTED_LANGS = (
  ENABLE_LOCALIZED_LANGUAGES ? ["hi", "hinglish", "en"] : ["en"]
) as readonly string[];
