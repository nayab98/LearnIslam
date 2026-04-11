"use client";

import { useLanguage } from "@/lib/language-context";
import { t } from "@/lib/translations";
import { BookOpen, ArrowLeftRight, Type, Layers, MessageCircle } from "lucide-react";

const alphabet = [
  { ar: "ا", name: "Alif", sound: "a (as in 'about')" },
  { ar: "ب", name: "Ba", sound: "b (as in 'ball')" },
  { ar: "ت", name: "Ta", sound: "t (as in 'top')" },
  { ar: "ث", name: "Tha", sound: "th (as in 'think')" },
  { ar: "ج", name: "Jim", sound: "j (as in 'jam')" },
  { ar: "ح", name: "Ha", sound: "h (heavy, from throat)" },
  { ar: "خ", name: "Kha", sound: "kh (as in 'Bach')" },
  { ar: "د", name: "Dal", sound: "d (as in 'door')" },
  { ar: "ذ", name: "Dhal", sound: "dh (as in 'this')" },
  { ar: "ر", name: "Ra", sound: "r (rolled, like Hindi र)" },
  { ar: "ز", name: "Zay", sound: "z (as in 'zoo')" },
  { ar: "س", name: "Sin", sound: "s (as in 'sun')" },
  { ar: "ش", name: "Shin", sound: "sh (as in 'ship')" },
  { ar: "ص", name: "Sad", sound: "s (heavy, emphatic)" },
  { ar: "ض", name: "Dad", sound: "d (heavy, emphatic)" },
  { ar: "ط", name: "Ta", sound: "t (heavy, emphatic)" },
  { ar: "ظ", name: "Dha", sound: "dh (heavy, emphatic)" },
  { ar: "ع", name: "Ayn", sound: "' (deep throat sound)" },
  { ar: "غ", name: "Ghayn", sound: "gh (French 'r'-like)" },
  { ar: "ف", name: "Fa", sound: "f (as in 'fun')" },
  { ar: "ق", name: "Qaf", sound: "q (deep k, from throat)" },
  { ar: "ك", name: "Kaf", sound: "k (as in 'king')" },
  { ar: "ل", name: "Lam", sound: "l (as in 'lamp')" },
  { ar: "م", name: "Mim", sound: "m (as in 'moon')" },
  { ar: "ن", name: "Nun", sound: "n (as in 'noon')" },
  { ar: "ه", name: "Ha", sound: "h (light, as in 'hat')" },
  { ar: "و", name: "Waw", sound: "w / oo (as in 'wow')" },
  { ar: "ي", name: "Ya", sound: "y / ee (as in 'yes')" },
];

const harakat = [
  { name: "Fathah", symbol: "بَ", sound: "ba", desc: "'a' sound (like Hindi अ)", mark: "  َ " },
  { name: "Kasrah", symbol: "بِ", sound: "bi", desc: "'i' sound (like Hindi इ)", mark: "  ِ " },
  { name: "Dammah", symbol: "بُ", sound: "bu", desc: "'u' sound (like Hindi उ)", mark: "  ُ " },
  { name: "Sukun", symbol: "بْ", sound: "b (no vowel)", desc: "silence — consonant only", mark: "  ْ " },
  { name: "Shaddah", symbol: "بَّ", sound: "bb (doubled)", desc: "double consonant stress", mark: "  ّ " },
];

const tanween = [
  { name: "Fathatayn", symbol: "بً", sound: "-an", mark: "  ً " },
  { name: "Kasratayn", symbol: "بٍ", sound: "-in", mark: "  ٍ " },
  { name: "Dammatayn", symbol: "بٌ", sound: "-un", mark: "  ٌ " },
];

const grammar = [
  {
    type: "Ism",
    arabic: "اسم",
    meaning: "Noun",
    hi: "संज्ञा (इस्म)",
    hinglish: "Ism (Noun)",
    examples: [
      { ar: "كِتَابٌ", en: "Book (Kitab)", hi: "किताब" },
      { ar: "رَجُلٌ", en: "Man (Rajul)", hi: "आदमी" },
      { ar: "مَسْجِدٌ", en: "Mosque (Masjid)", hi: "मस्जिद" },
    ],
  },
  {
    type: "Fi'l",
    arabic: "فعل",
    meaning: "Verb",
    hi: "क्रिया (फ़े'ल)",
    hinglish: "Fi'l (Verb)",
    examples: [
      { ar: "كَتَبَ", en: "He wrote (Kataba)", hi: "उसने लिखा" },
      { ar: "قَرَأَ", en: "He read (Qara'a)", hi: "उसने पढ़ा" },
      { ar: "ذَهَبَ", en: "He went (Dhahaba)", hi: "वह गया" },
    ],
  },
  {
    type: "Harf",
    arabic: "حرف",
    meaning: "Particle",
    hi: "हर्फ़ (अव्यय)",
    hinglish: "Harf (Particle)",
    examples: [
      { ar: "فِي", en: "In (Fi)", hi: "में" },
      { ar: "مِنْ", en: "From (Min)", hi: "से" },
      { ar: "عَلَى", en: "On/Upon (Ala)", hi: "पर / ऊपर" },
    ],
  },
];

const phrases = [
  { ar: "بِسْمِ اللَّهِ", tr: "Bismillah", en: "In the name of Allah", hi: "अल्लाह के नाम से" },
  { ar: "الْحَمْدُ لِلَّهِ", tr: "Alhamdulillah", en: "All praise is for Allah", hi: "सारी तारीफ़ अल्लाह के लिए" },
  { ar: "سُبْحَانَ اللَّهِ", tr: "SubhanAllah", en: "Glory be to Allah", hi: "अल्लाह पाक है" },
  { ar: "اللَّهُ أَكْبَرُ", tr: "Allahu Akbar", en: "Allah is the Greatest", hi: "अल्लाह सबसे बड़ा है" },
  { ar: "إِنْ شَاءَ اللَّهُ", tr: "InshaAllah", en: "If Allah wills", hi: "अगर अल्लाह ने चाहा" },
  { ar: "مَا شَاءَ اللَّهُ", tr: "MashaAllah", en: "What Allah has willed", hi: "अल्लाह ने जो चाहा" },
  { ar: "لَا إِلَٰهَ إِلَّا اللَّهُ", tr: "La ilaha illa Allah", en: "There is no god but Allah", hi: "अल्लाह के सिवा कोई माबूद नहीं" },
  { ar: "أَسْتَغْفِرُ اللَّهَ", tr: "Astaghfirullah", en: "I seek forgiveness from Allah", hi: "मैं अल्लाह से माफ़ी माँगता हूँ" },
  { ar: "جَزَاكَ اللَّهُ خَيْرًا", tr: "JazakAllahu Khairan", en: "May Allah reward you with good", hi: "अल्लाह तुम्हें अच्छा बदला दे" },
  { ar: "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ", tr: "La hawla wa la quwwata illa billah", en: "There is no power except with Allah", hi: "अल्लाह के बिना कोई ताक़त नहीं" },
];

function SectionCard({ children, id }: { children: React.ReactNode; id?: string }) {
  return (
    <section id={id} className="bg-card border border-border rounded-2xl p-6 sm:p-8">
      {children}
    </section>
  );
}

export default function ArabicBasicsPage() {
  const { lang } = useLanguage();
  const showRef = lang === "hi" || lang === "hinglish";

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="mb-2">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-xl bg-teal-100 dark:bg-teal-900/30">
            <BookOpen className="h-5 w-5 text-teal-600 dark:text-teal-400" />
          </div>
          <h1 className="text-3xl font-bold">{t("arabic_title", lang)}</h1>
        </div>
        <p className="text-muted-foreground text-lg max-w-2xl">
          {t("arabic_subtitle", lang)}
        </p>
      </div>

      {/* Quick nav */}
      <nav className="flex flex-wrap gap-2">
        {[
          { id: "alphabet", icon: "ا", label: "Huroof" },
          { id: "direction", icon: "↔", label: "Direction" },
          { id: "harakat", icon: "  َ ", label: "Harakat" },
          { id: "grammar", icon: "ن", label: "Grammar" },
          { id: "phrases", icon: "☪", label: "Phrases" },
        ].map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-teal-50 dark:bg-teal-950/30 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 hover:bg-teal-100 dark:hover:bg-teal-900/40 transition-colors"
          >
            <span className="font-arabic">{s.icon}</span> {s.label}
          </a>
        ))}
      </nav>

      {/* 1. Arabic Alphabet */}
      <SectionCard id="alphabet">
        <div className="flex items-center gap-2 mb-6">
          <Type className="h-5 w-5 text-teal-600 dark:text-teal-400" />
          <h2 className="text-2xl font-bold">
            {lang === "hi" ? "अरबी हुरूफ़ (حروف)" : lang === "hinglish" ? "Arabi Huroof (حروف)" : "Arabic Alphabet (Huroof)"}
          </h2>
        </div>
        <p className="text-muted-foreground mb-6">
          {lang === "hi"
            ? "अरबी में 28 बुनियादी हुरूफ़ (अक्षर) हैं। हर हर्फ़ की पहचान करें।"
            : lang === "hinglish"
              ? "Arabi mein 28 bunyadi huroof (akshar) hain. Har harf ki pehchaan karein."
              : "Arabic has 28 basic letters. Learn to recognize each one."}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
          {alphabet.map((letter) => (
            <div
              key={letter.name + letter.ar}
              className="group flex flex-col items-center p-3 rounded-xl border border-border bg-background hover:border-teal-400 hover:shadow-md transition-all cursor-default"
            >
              <span className="font-arabic text-4xl text-teal-700 dark:text-teal-300 mb-1 group-hover:scale-110 transition-transform">
                {letter.ar}
              </span>
              <span className="text-sm font-semibold">{letter.name}</span>
              <span className="text-[11px] text-muted-foreground text-center leading-tight mt-0.5">
                {letter.sound}
              </span>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* 2. Reading Direction */}
      <SectionCard id="direction">
        <div className="flex items-center gap-2 mb-6">
          <ArrowLeftRight className="h-5 w-5 text-teal-600 dark:text-teal-400" />
          <h2 className="text-2xl font-bold">
            {lang === "hi" ? "पढ़ने की दिशा" : lang === "hinglish" ? "Padhne ki Disha" : "Reading Direction"}
          </h2>
        </div>

        <div className="space-y-6">
          <div className="bg-teal-50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-800 rounded-xl p-5">
            <p className="text-lg font-medium mb-2">
              {lang === "hi"
                ? "अरबी दाएं से बाएं (→) पढ़ी जाती है — हिंदी और अंग्रेज़ी के उलट।"
                : lang === "hinglish"
                  ? "Arabi daayein se baayein (→) padhi jaati hai — Hindi aur English ke ulat."
                  : "Arabic is read from right to left (←) — the opposite of English and Hindi."}
            </p>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span>English: Left → Right</span>
              <span className="text-teal-500">|</span>
              <span className="font-arabic">عربی: دائیں ← بائیں</span>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-3">
              {lang === "hi" ? "हुरूफ़ कैसे जुड़ते हैं" : lang === "hinglish" ? "Huroof kaise judte hain" : "How Letters Connect"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {lang === "hi"
                ? "अरबी के ज़्यादातर हुरूफ़ एक-दूसरे से जुड़कर शब्द बनाते हैं, जैसे उर्दू में होता है।"
                : lang === "hinglish"
                  ? "Arabi ke zyada-tar huroof ek-doosre se judkar lafz banate hain, jaise Urdu mein hota hai."
                  : "Most Arabic letters connect to each other to form words, similar to Urdu script."}
            </p>
            <div className="bg-background border border-border rounded-xl p-5">
              <p className="text-sm text-muted-foreground mb-2">
                {lang === "hi" ? "उदाहरण:" : lang === "hinglish" ? "Misaal:" : "Example:"}
                {" "}<span className="font-semibold">كَتَبَ</span> (kataba — he wrote)
              </p>
              <div className="flex items-center justify-center gap-4 my-4 flex-wrap" dir="rtl">
                <div className="flex flex-col items-center">
                  <span className="font-arabic text-3xl text-teal-700 dark:text-teal-300">كَ</span>
                  <span className="text-xs text-muted-foreground">ka</span>
                </div>
                <span className="text-2xl text-muted-foreground">+</span>
                <div className="flex flex-col items-center">
                  <span className="font-arabic text-3xl text-teal-700 dark:text-teal-300">تَ</span>
                  <span className="text-xs text-muted-foreground">ta</span>
                </div>
                <span className="text-2xl text-muted-foreground">+</span>
                <div className="flex flex-col items-center">
                  <span className="font-arabic text-3xl text-teal-700 dark:text-teal-300">بَ</span>
                  <span className="text-xs text-muted-foreground">ba</span>
                </div>
                <span className="text-2xl text-muted-foreground">=</span>
                <div className="flex flex-col items-center">
                  <span className="font-arabic text-4xl font-bold text-teal-700 dark:text-teal-300">كَتَبَ</span>
                  <span className="text-xs text-muted-foreground">kataba</span>
                </div>
              </div>
              {showRef && (
                <p className="text-xs text-muted-foreground text-center">
                  Letters join to form connected words (जुड़े हुए हुरूफ़)
                </p>
              )}
            </div>
          </div>
        </div>
      </SectionCard>

      {/* 3. Harakat (Vowel Marks) */}
      <SectionCard id="harakat">
        <div className="flex items-center gap-2 mb-6">
          <Type className="h-5 w-5 text-teal-600 dark:text-teal-400" />
          <h2 className="text-2xl font-bold">
            {lang === "hi" ? "हरकात (حرکات) — स्वर चिह्न" : lang === "hinglish" ? "Harakat (حرکات) — Swar Chinh" : "Harakat — Vowel Marks"}
          </h2>
        </div>
        <p className="text-muted-foreground mb-6">
          {lang === "hi"
            ? "अरबी में छोटे निशान (हरकात) हर्फ़ के ऊपर या नीचे लगाकर आवाज़ बताते हैं।"
            : lang === "hinglish"
              ? "Arabi mein chote nishaan (harakat) harf ke upar ya neeche lagakar awaaz bataate hain."
              : "Small marks (harakat) placed above or below letters indicate vowel sounds."}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {harakat.map((h) => (
            <div
              key={h.name}
              className="flex items-start gap-4 p-4 rounded-xl border border-border bg-background hover:border-teal-400 transition-colors"
            >
              <div className="flex-shrink-0 w-16 h-16 rounded-lg bg-teal-50 dark:bg-teal-950/30 flex items-center justify-center">
                <span className="font-arabic text-3xl text-teal-700 dark:text-teal-300">{h.symbol}</span>
              </div>
              <div className="min-w-0">
                <p className="font-semibold">{h.name} <span className="text-muted-foreground font-normal text-sm">({h.mark.trim()})</span></p>
                <p className="text-sm text-muted-foreground">{h.desc}</p>
                <p className="text-sm mt-1">
                  <span className="font-arabic text-base">{h.symbol}</span>
                  <span className="text-muted-foreground"> = {h.sound}</span>
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Tanween */}
        <div className="border-t border-border pt-6">
          <h3 className="font-semibold text-lg mb-1">
            Tanween (تنوین)
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {lang === "hi"
              ? "तनवीन — नून की आवाज़ जो अंत में आती है (ن बिना लिखे)"
              : lang === "hinglish"
                ? "Tanween — Noon ki awaaz jo ant mein aati hai (ن bina likhe)"
                : "Tanween — a nasal 'n' sound at the end of a word (unwritten ن)"}
          </p>
          <div className="flex flex-wrap gap-4">
            {tanween.map((tw) => (
              <div
                key={tw.name}
                className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border bg-background"
              >
                <span className="font-arabic text-2xl text-teal-700 dark:text-teal-300">{tw.symbol}</span>
                <div>
                  <p className="text-sm font-semibold">{tw.name} <span className="text-muted-foreground font-normal">({tw.mark.trim()})</span></p>
                  <p className="text-xs text-muted-foreground">{tw.sound}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </SectionCard>

      {/* 4. Basic Grammar */}
      <SectionCard id="grammar">
        <div className="flex items-center gap-2 mb-6">
          <Layers className="h-5 w-5 text-teal-600 dark:text-teal-400" />
          <h2 className="text-2xl font-bold">
            {lang === "hi" ? "बुनियादी ग्रामर" : lang === "hinglish" ? "Bunyadi Grammar" : "Basic Grammar Concepts"}
          </h2>
        </div>
        <p className="text-muted-foreground mb-6">
          {lang === "hi"
            ? "अरबी के हर शब्द को तीन में से एक क़िस्म में रखा जा सकता है:"
            : lang === "hinglish"
              ? "Arabi ke har lafz ko teen mein se ek qism mein rakha ja sakta hai:"
              : "Every Arabic word falls into one of three categories:"}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {grammar.map((cat) => (
            <div
              key={cat.type}
              className="rounded-xl border-2 border-teal-200 dark:border-teal-800 bg-teal-50/50 dark:bg-teal-950/20 p-5"
            >
              <div className="text-center mb-4">
                <span className="font-arabic text-4xl text-teal-700 dark:text-teal-300">{cat.arabic}</span>
                <h3 className="text-xl font-bold mt-1">
                  {lang === "hi" ? cat.hi : lang === "hinglish" ? cat.hinglish : `${cat.type} — ${cat.meaning}`}
                </h3>
                {showRef && (
                  <p className="text-xs text-muted-foreground">{cat.type} = {cat.meaning}</p>
                )}
              </div>
              <div className="space-y-2">
                {cat.examples.map((ex) => (
                  <div
                    key={ex.ar}
                    className="flex items-center justify-between px-3 py-2 rounded-lg bg-background border border-border"
                  >
                    <span className="font-arabic text-xl text-teal-700 dark:text-teal-300">{ex.ar}</span>
                    <span className="text-sm text-right">
                      {lang === "hi" ? ex.hi : lang === "hinglish" ? ex.hi : ex.en}
                      {showRef && <span className="block text-xs text-muted-foreground">{ex.en}</span>}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* 5. Common Quranic Phrases */}
      <SectionCard id="phrases">
        <div className="flex items-center gap-2 mb-6">
          <MessageCircle className="h-5 w-5 text-teal-600 dark:text-teal-400" />
          <h2 className="text-2xl font-bold">
            {lang === "hi" ? "क़ुरआन के मशहूर जुमले" : lang === "hinglish" ? "Quran ke Mashhoor Jumle" : "Common Quranic Phrases"}
          </h2>
        </div>
        <p className="text-muted-foreground mb-6">
          {lang === "hi"
            ? "ये जुमले रोज़मर्रा की ज़िंदगी और नमाज़ में बहुत इस्तेमाल होते हैं।"
            : lang === "hinglish"
              ? "Ye jumle rozm-arra ki zindagi aur namaaz mein bahut istemal hote hain."
              : "These phrases are commonly used in daily life and prayer."}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {phrases.map((ph) => (
            <div
              key={ph.tr}
              className="group flex flex-col p-4 rounded-xl border border-border bg-background hover:border-teal-400 hover:shadow-md transition-all"
            >
              <p className="font-arabic text-2xl text-teal-700 dark:text-teal-300 mb-2 text-right leading-relaxed" dir="rtl">
                {ph.ar}
              </p>
              <p className="font-semibold">{ph.tr}</p>
              <p className="text-sm text-muted-foreground">
                {lang === "hi" ? ph.hi : lang === "hinglish" ? ph.hi : ph.en}
              </p>
              {showRef && (
                <p className="text-xs text-muted-foreground mt-1">{ph.en}</p>
              )}
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
