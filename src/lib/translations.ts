export type Lang = "hi" | "hinglish" | "en";

const translations: Record<string, Record<Lang, string>> = {
  // NAV
  nav_surahs:   { hi: "सूरतें", hinglish: "Suraatein", en: "Surahs" },
  nav_quiz:     { hi: "क्विज़", hinglish: "Quiz", en: "Quiz" },
  nav_progress: { hi: "प्रगति", hinglish: "Pragati", en: "Progress" },
  nav_login:    { hi: "लॉग इन", hinglish: "Log In", en: "Log In" },
  nav_logout:   { hi: "लॉग आउट", hinglish: "Log Out", en: "Log Out" },
  nav_start:    { hi: "शुरू करें", hinglish: "Shuru Karen", en: "Get Started" },

  // LANDING
  landing_badge:      { hi: "हिंदी-उर्दू में क़ुरआन — भारतीयों के लिए", hinglish: "Hindi-Urdu mein Quran — Bharatiyon ke liye", en: "Quran in Hindi-Urdu — For Indians" },
  landing_hero_quote: { hi: "पढ़ो अपने रब के नाम से", hinglish: "Padho apne Rabb ke naam se", en: "Read in the name of your Lord" },
  landing_hero_ref:   { hi: "सूरह अल-अलक़", hinglish: "Surah Al-Alaq", en: "Surah Al-Alaq" },
  landing_hero_desc:  { hi: "Structure के साथ क़ुरआन और इस्लाम सीखें।", hinglish: "Structure ke saath Quran aur Islam seekhein.", en: "Learn Quran and Islam with structure." },
  landing_cta_read:   { hi: "सूरतें पढ़ें", hinglish: "Suraatein Padhein", en: "Read Surahs" },
  landing_cta_quiz:   { hi: "क्विज़ शुरू करें", hinglish: "Quiz Shuru Karen", en: "Start Quiz" },
  landing_features_title: { hi: "क्या-क्या मिलेगा?", hinglish: "Kya-Kya Milega?", en: "What You Get" },
  landing_how_title:    { hi: "कैसे शुरू करें?", hinglish: "Kaise Shuru Karen?", en: "How to Start?" },
  landing_how_subtitle: { hi: "बस 4 आसान कदम", hinglish: "Bas 4 Aasaan Qadam", en: "Just 4 Easy Steps" },
  landing_cta_final:    { hi: "आज से शुरू करें", hinglish: "Aaj Se Shuru Karen", en: "Start Today" },
  landing_cta_free:     { hi: "मुफ़्त शुरू करें", hinglish: "Muft Shuru Karen", en: "Start Free" },
  landing_cta_peek:     { hi: "पहले देखें", hinglish: "Pehle Dekhein", en: "Preview First" },

  // FEATURE TILES
  feat_surahs_title:  { hi: "सभी 114 सूरतें", hinglish: "Sabhi 114 Suraatein", en: "All 114 Surahs" },
  feat_surahs_desc:   { hi: "अरबी मूल पाठ के साथ हिंदी और उर्दू अनुवाद।", hinglish: "Arabi asl matn ke saath Hindi aur Urdu tarjuma.", en: "Arabic text with Hindi & Urdu translations." },
  feat_words_title:   { hi: "शब्द-दर-शब्द अर्थ", hinglish: "Lafz-ba-Lafz Matlab", en: "Word-by-Word Meaning" },
  feat_words_desc:    { hi: "हर अरबी शब्द पर क्लिक करें और उसका अर्थ देखें।", hinglish: "Har Arabi lafz par click karein aur uska matlab dekhein.", en: "Click any Arabic word to see its meaning." },
  feat_audio_title:   { hi: "क़िरात सुनें", hinglish: "Qiraat Sunein", en: "Listen to Recitation" },
  feat_audio_desc:    { hi: "शेख़ अलफ़ासी की आवाज़ में सुनें।", hinglish: "Sheikh Alafasy ki aawaz mein sunein.", en: "Listen in Sheikh Alafasy's voice." },
  feat_quiz_title:    { hi: "इंटरैक्टिव क्विज़", hinglish: "Interactive Quiz", en: "Interactive Quiz" },
  feat_quiz_desc:     { hi: "आयत दिखाई जाती है — सही तर्जुमा चुनें।", hinglish: "Aayat dikhaayi jaati hai — sahi tarjuma chunein.", en: "An ayah is shown — pick the correct translation." },
  feat_track_title:   { hi: "प्रगति ट्रैकिंग", hinglish: "Pragati Tracking", en: "Progress Tracking" },
  feat_track_desc:    { hi: "रोज़ाना streak, XP अंक, पूरी की गई सूरतें।", hinglish: "Roz ka streak, XP points, poori ki gayi Suraatein.", en: "Daily streak, XP points, completed Surahs." },
  feat_arabic_title:  { hi: "अरबी की बुनियाद", hinglish: "Arabi ki Bunyaad", en: "Arabic Basics" },
  feat_arabic_desc:   { hi: "अरबी भाषा के बुनियादी उसूल सीखें।", hinglish: "Arabi bhasha ke bunyadi usool seekhein.", en: "Learn the fundamentals of Arabic." },

  // STEPS
  step1_title: { hi: "सूरत चुनें", hinglish: "Surah Chunein", en: "Choose a Surah" },
  step1_desc:  { hi: "114 सूरतों की सूची से चुनें।", hinglish: "114 Suraaton ki list se chunein.", en: "Choose from the list of 114 Surahs." },
  step2_title: { hi: "पढ़ें और सुनें", hinglish: "Padhein aur Sunein", en: "Read & Listen" },
  step2_desc:  { hi: "अरबी पाठ, तर्जुमा और क़िरात एक साथ।", hinglish: "Arabi matn, tarjuma aur qiraat ek saath.", en: "Arabic text, translation & recitation together." },
  step3_title: { hi: "शब्द समझें", hinglish: "Lafz Samjhein", en: "Understand Words" },
  step3_desc:  { hi: "हर अरबी शब्द का अर्थ देखें।", hinglish: "Har Arabi lafz ka matlab dekhein.", en: "See the meaning of every Arabic word." },
  step4_title: { hi: "क्विज़ दें", hinglish: "Quiz Dein", en: "Take a Quiz" },
  step4_desc:  { hi: "अपना इम्तिहान दें।", hinglish: "Apna imtihaan dein.", en: "Test yourself." },

  // QURAN VERSE ON LANDING
  verse_text: { hi: "और हम क़ुरआन में वह नाज़िल करते हैं जो शिफ़ा और रहमत है।", hinglish: "Aur hum Quran mein woh naazil karte hain jo shifa aur rehmat hai.", en: "And We send down of the Quran that which is healing and mercy." },
  verse_ref:  { hi: "सूरह अल-इसरा, आयत 82", hinglish: "Surah Al-Isra, Aayat 82", en: "Surah Al-Isra, Verse 82" },
  landing_cta_desc: { hi: "मुफ़्त account बनाएं और यात्रा शुरू करें।", hinglish: "Muft account banaein aur safar shuru karen.", en: "Create a free account and start your journey." },

  // STATS
  stat_surahs: { hi: "सूरतें", hinglish: "Suraatein", en: "Surahs" },
  stat_ayat:   { hi: "आयतें", hinglish: "Aayatein", en: "Verses" },
  stat_paare:  { hi: "पारे", hinglish: "Paare", en: "Juz" },

  // FOOTER
  footer_tagline: { hi: "हिंदी-उर्दू में क़ुरआन सीखें", hinglish: "Hindi-Urdu mein Quran Seekhein", en: "Learn Quran in Hindi-Urdu" },

  // SURAHS PAGE
  surahs_title: { hi: "सूरतें", hinglish: "Suraatein", en: "Surahs" },
  surahs_subtitle: { hi: "क़ुरआन की 114 सूरतें", hinglish: "Quran ki 114 Suraatein", en: "All 114 Surahs of the Quran" },
  kul_surahs: { hi: "कुल सूरतें", hinglish: "Kul Suraatein", en: "Total Surahs" },
  makki: { hi: "मक्की", hinglish: "Makki", en: "Meccan" },
  madani: { hi: "मदनी", hinglish: "Madani", en: "Medinan" },
  kul_ayat: { hi: "कुल आयतें", hinglish: "Kul Aayatein", en: "Total Verses" },
  search_surah: { hi: "सूरत का नाम या नंबर खोजें...", hinglish: "Surah ka naam ya number khojein...", en: "Search surah name or number..." },
  sabhi: { hi: "सभी", hinglish: "Sabhi", en: "All" },
  ayatein: { hi: "आयतें", hinglish: "Aayatein", en: "Verses" },
  padhein: { hi: "पढ़ें →", hinglish: "Padhein →", en: "Read →" },
  no_surah: { hi: "कोई सूरत नहीं मिली।", hinglish: "Koi Surah nahi mili.", en: "No Surah found." },
  try_again: { hi: "खोज बदलकर दोबारा कोशिश करें।", hinglish: "Khoj badal kar dobara koshish karein.", en: "Try changing your search." },

  // SURAH READER
  surah: { hi: "सूरह", hinglish: "Surah", en: "Surah" },
  sunein: { hi: "सुनें", hinglish: "Sunein", en: "Listen" },
  rokein: { hi: "रोकें", hinglish: "Rokein", en: "Pause" },
  tarjuma_hide: { hi: "तर्जुमा छुपाएं", hinglish: "Tarjuma Chhupayein", en: "Hide Translation" },
  tarjuma_show: { hi: "तर्जुमा दिखाएं", hinglish: "Tarjuma Dikhayein", en: "Show Translation" },
  lafz_ba_lafz: { hi: "शब्द-दर-शब्द", hinglish: "Lafz-ba-Lafz", en: "Word-by-Word" },
  padha: { hi: "पढ़ा", hinglish: "Padha", en: "Read" },
  mark_read: { hi: "पढ़ा मार्क करें", hinglish: "Padha Mark Karen", en: "Mark as Read" },
  login_to_save: { hi: "प्रगति सेव करने के लिए लॉग इन करें", hinglish: "Pragati save karne ke liye Log In karein", en: "Log in to save progress" },

  // QUIZ
  quiz_title: { hi: "क्विज़", hinglish: "Quiz", en: "Quiz" },
  quiz_subtitle: { hi: "आयत दिखाई जाएगी, सही तर्जुमा चुनें।", hinglish: "Aayat dikhaayi jaayegi, sahi tarjuma chunein.", en: "An ayah will appear, pick the correct translation." },
  aasaan: { hi: "आसान", hinglish: "Aasaan", en: "Easy" },
  madhyam: { hi: "मध्यम", hinglish: "Madhyam", en: "Medium" },
  kathin: { hi: "कठिन", hinglish: "Kathin", en: "Hard" },
  sawaal: { hi: "सवाल", hinglish: "Sawaal", en: "Question" },
  score: { hi: "स्कोर", hinglish: "Score", en: "Score" },
  quiz_loading: { hi: "सवाल तैयार हो रहे हैं...", hinglish: "Sawaal tayyar ho rahe hain...", en: "Preparing questions..." },
  quiz_empty: { hi: "सवाल नहीं मिले।", hinglish: "Sawaal nahi mile.", en: "No questions found." },
  quiz_reload: { hi: "दोबारा लोड करें", hinglish: "Dobara Load Karen", en: "Reload" },
  quiz_done: { hi: "क्विज़ खत्म!", hinglish: "Quiz Khatam!", en: "Quiz Complete!" },
  quiz_completed: { hi: "आपने क्विज़ पूरा किया", hinglish: "Aapne Quiz poora kiya", en: "You completed the quiz" },
  sahi: { hi: "सही", hinglish: "Sahi", en: "Correct" },
  shaandaar: { hi: "शानदार!", hinglish: "Shaandaar!", en: "Excellent!" },
  acha: { hi: "अच्छा!", hinglish: "Acha!", en: "Good!" },
  more_practice: { hi: "और अभ्यास करें", hinglish: "Aur abhyas karein", en: "More practice needed" },
  play_again: { hi: "फिर से खेलें", hinglish: "Phir Se Khelein", en: "Play Again" },
  other_level: { hi: "दूसरा स्तर चुनें", hinglish: "Doosra Darje Chunein", en: "Choose Another Level" },
  view_progress: { hi: "प्रगति देखें", hinglish: "Pragati Dekhein", en: "View Progress" },
  quiz_prompt: { hi: "इस आयत का सही तर्जुमा चुनें:", hinglish: "Is aayat ka sahi tarjuma chunein:", en: "Pick the correct translation of this ayah:" },
  correct_answer: { hi: "सही जवाब! शाबाश!", hinglish: "Sahi Jawaab! Shabash!", en: "Correct! Well done!" },
  wrong_answer: { hi: "गलत जवाब", hinglish: "Galat Jawaab", en: "Wrong Answer" },
  correct_was: { hi: "सही जवाब:", hinglish: "Sahi Jawaab:", en: "Correct answer:" },
  see_result: { hi: "नतीजा देखें", hinglish: "Nateeja Dekhein", en: "See Result" },
  next_question: { hi: "अगला सवाल", hinglish: "Agla Sawaal", en: "Next Question" },
  quiz_how_title: { hi: "क्विज़ कैसे काम करता है?", hinglish: "Quiz Kaise Kaam Karta Hai?", en: "How Does the Quiz Work?" },
  quiz_desc: { hi: "आयत दिखाई जाएगी, सही तर्जुमा चुनें। तीन मुश्किलात के दर्जे।", hinglish: "Aayat dikhaayi jaayegi, sahi tarjuma chunein. Teen mushkilaat ke darje.", en: "An ayah will appear, pick the correct translation. Three difficulty levels." },
  quiz_easy_desc: { hi: "छोटी सूरतें — अल-फ़ातिहा से अन-नास तक की आसान आयतें", hinglish: "Choti Suraatein — Al-Fatihah se An-Naas tak ki aasaan aayatein", en: "Short Surahs — easy ayahs from Al-Fatihah to An-Naas" },
  quiz_easy_surahs: { hi: "सूरह 108–114", hinglish: "Surah 108–114", en: "Surah 108–114" },
  quiz_easy_count: { hi: "28 सवाल", hinglish: "28 Sawaal", en: "28 Questions" },
  quiz_medium_desc: { hi: "मध्यम लंबाई की सूरतें — थोड़ा मुश्किल तर्जुमा", hinglish: "Madhyam lambai ki Suraatein — thoda mushkil tarjuma", en: "Medium-length Surahs — slightly harder translations" },
  quiz_medium_surahs: { hi: "सूरह 67–107", hinglish: "Surah 67–107", en: "Surah 67–107" },
  quiz_medium_count: { hi: "200+ सवाल", hinglish: "200+ Sawaal", en: "200+ Questions" },
  quiz_hard_desc: { hi: "लंबी और जटिल सूरतें — गहरी समझ के लिए", hinglish: "Lambi aur jatil Suraatein — gehri samajh ke liye", en: "Long, complex Surahs — for deeper understanding" },
  quiz_hard_surahs: { hi: "सूरह 1–66", hinglish: "Surah 1–66", en: "Surah 1–66" },
  quiz_hard_count: { hi: "500+ सवाल", hinglish: "500+ Sawaal", en: "500+ Questions" },
  quiz_step1_title: { hi: "आयत दिखाई जाती है", hinglish: "Aayat Dikhaayi Jaati Hai", en: "An Ayah Appears" },
  quiz_step1_desc: { hi: "अरबी में एक आयत स्क्रीन पर आती है।", hinglish: "Arabi mein ek aayat screen par aati hai.", en: "An Arabic ayah appears on the screen." },
  quiz_step2_title: { hi: "4 विकल्प मिलते हैं", hinglish: "4 Vikalp Milte Hain", en: "4 Options Appear" },
  quiz_step2_desc: { hi: "चार हिंदी तर्जुमे दिए जाते हैं — एक सही, तीन गलत।", hinglish: "Chaar Hindi tarjume diye jaate hain — ek sahi, teen galat.", en: "Four Hindi translations are shown — one correct, three wrong." },
  quiz_step3_title: { hi: "जवाब चुनें", hinglish: "Jawaab Chunein", en: "Pick Your Answer" },
  quiz_step3_desc: { hi: "सोचें और सही तर्जुमा क्लिक करें।", hinglish: "Sochein aur sahi tarjuma click karein.", en: "Think and click the correct translation." },
  quiz_step4_title: { hi: "XP कमाएं", hinglish: "XP Kamaayein", en: "Earn XP" },
  quiz_step4_desc: { hi: "सही जवाब पर XP मिलता है और streak बढ़ती है।", hinglish: "Sahi jawaab par XP milta hai aur streak badhti hai.", en: "Earn XP for correct answers and build your streak." },

  // LOGIN / SIGNUP
  welcome_back: { hi: "वापस स्वागत है", hinglish: "Wapas Khush Aamdeed", en: "Welcome Back" },
  login_subtitle: { hi: "अपने account में लॉग इन करें", hinglish: "Apne account mein log in karein", en: "Log in to your account" },
  email: { hi: "ईमेल", hinglish: "Email", en: "Email" },
  password: { hi: "पासवर्ड", hinglish: "Password", en: "Password" },
  login_btn: { hi: "लॉग इन करें", hinglish: "Log In Karen", en: "Log In" },
  no_account: { hi: "account नहीं है?", hinglish: "Account nahi hai?", en: "Don't have an account?" },
  create_now: { hi: "अभी बनाएं", hinglish: "Abhi Banaein", en: "Create Now" },
  wrong_creds: { hi: "ईमेल या पासवर्ड गलत है।", hinglish: "Email ya password galat hai.", en: "Email or password is incorrect." },
  signup_title: { hi: "मुफ़्त account बनाएं", hinglish: "Muft Account Banaein", en: "Create Free Account" },
  signup_subtitle: { hi: "अपनी Quran यात्रा शुरू करें", hinglish: "Apni Quran safar shuru karein", en: "Start your Quran journey" },
  naam: { hi: "नाम", hinglish: "Naam", en: "Name" },
  signup_btn: { hi: "account बनाएं", hinglish: "Account Banaein", en: "Create Account" },
  has_account: { hi: "पहले से account है?", hinglish: "Pehle se account hai?", en: "Already have an account?" },
  verify_email: { hi: "ईमेल verify करें", hinglish: "Email Verify Karein", en: "Verify Your Email" },
  verify_desc: { hi: "confirmation link भेजा है।", hinglish: "Confirmation link bheja hai.", en: "We sent a confirmation link." },
  go_login: { hi: "लॉग इन पेज पर जाएं", hinglish: "Log In Page Par Jaayein", en: "Go to Login" },

  // DASHBOARD
  dashboard_title: { hi: "मेरा Dashboard", hinglish: "Mera Dashboard", en: "My Dashboard" },
  dashboard_subtitle: { hi: "आपकी Quran सीखने की प्रगति", hinglish: "Aapki Quran seekhne ki pragati", en: "Your Quran learning progress" },
  xp_progress: { hi: "XP प्रगति", hinglish: "XP Pragati", en: "XP Progress" },
  streak_label: { hi: "Streak", hinglish: "Streak", en: "Streak" },
  din: { hi: "दिन", hinglish: "Din", en: "Days" },
  padhi: { hi: "पढ़ी", hinglish: "Padhi", en: "Read" },
  sateekta: { hi: "सटीकता", hinglish: "Sateekta", en: "Accuracy" },
  quiz_mein: { hi: "क्विज़ में", hinglish: "Quiz mein", en: "in Quiz" },
  surah_progress: { hi: "सूरतें पढ़ने की प्रगति", hinglish: "Suraatein Padhne ki Pragati", en: "Surah Reading Progress" },
  baaki: { hi: "बाकी हैं", hinglish: "baaki hain", en: "remaining" },
  current_streak: { hi: "मौजूदा streak", hinglish: "Maujuda streak", en: "Current streak" },
  longest_streak: { hi: "सबसे लंबी streak", hinglish: "Sabse lambi streak", en: "Longest streak" },
  last_active: { hi: "आख़िरी बार active:", hinglish: "Aakhri baar active:", en: "Last active:" },
  read_surah: { hi: "सूरत पढ़ें", hinglish: "Surah Padhein", en: "Read a Surah" },
  available: { hi: "उपलब्ध", hinglish: "available", en: "available" },
  take_quiz: { hi: "क्विज़ दें", hinglish: "Quiz Dein", en: "Take Quiz" },
  earn_xp: { hi: "XP कमाएं, streak बढ़ाएं", hinglish: "XP kamaayein, streak badhaayein", en: "Earn XP, build streaks" },
  login_for_progress: { hi: "प्रगति देखने के लिए लॉग इन करें", hinglish: "Pragati dekhne ke liye Log In karein", en: "Log in to view your progress" },

  // LAFZ-BA-LAFZ PAGE
  lafz_title: { hi: "शब्द-दर-शब्द", hinglish: "Lafz-ba-Lafz", en: "Word-by-Word" },
  lafz_subtitle: { hi: "क़ुरआन के सबसे ज़्यादा इस्तेमाल होने वाले अरबी शब्द सीखें", hinglish: "Quran ke sabse zyada istemal hone wale Arabi lafz seekhein", en: "Learn the most frequently used Arabic words in the Quran" },
  flip_to_reveal: { hi: "अर्थ देखने के लिए कार्ड पर क्लिक करें", hinglish: "Matlab dekhne ke liye card par click karein", en: "Click card to reveal meaning" },

  // HADEES PAGE
  hadees_title: { hi: "हदीस", hinglish: "Hadees", en: "Hadith" },
  hadees_subtitle: { hi: "प्रामाणिक हदीसें पढ़ें", hinglish: "Praamanik Hadeesein Padhein", en: "Read Authentic Hadiths" },
  feat_hadees_title: { hi: "हदीस", hinglish: "Hadees", en: "Hadith" },
  feat_hadees_desc: { hi: "सहीह बुखारी, मुस्लिम और अन्य प्रामाणिक हदीसें", hinglish: "Sahih Bukhari, Muslim aur anya praamanik hadeesein", en: "Authentic hadiths from Sahih Bukhari, Muslim and more" },
  quiz_cat_hadith: { hi: "हदीसों का क्विज़", hinglish: "Hadeeso ka Quiz", en: "Hadith Quiz" },
  quiz_cat_word: { hi: "शब्दों के अर्थ", hinglish: "Lafz ke Matlab", en: "Word Meaning" },
  quiz_cat_ayah_comp: { hi: "आयत पूरी करें", hinglish: "Aayat Poori Karein", en: "Ayah Completion" },
  quiz_cat_ayah_mean: { hi: "आयत का तर्जुमा", hinglish: "Aayat ka Tarjuma", en: "Ayah Meaning" },
  quiz_cat_general: { hi: "आम इस्लामी मालूमात", hinglish: "Aam Islami Maloomat", en: "General Islamic" },

  // ARABIC BASICS PAGE
  arabic_title: { hi: "अरबी की बुनियाद", hinglish: "Arabi ki Bunyaad", en: "Arabic Basics" },
  arabic_subtitle: { hi: "अरबी भाषा की बुनियादी बातें सीखें", hinglish: "Arabi bhasha ki bunyadi baatein seekhein", en: "Learn the fundamentals of Arabic" },

  // DUAS PAGE
  duas_title: { hi: "दुआएं", hinglish: "Duaayein", en: "Duas" },
  duas_subtitle: { hi: "रोज़मर्रा की प्रामाणिक दुआओं का संग्रह", hinglish: "Rozmarra ki praamanik duaaon ka sangrah", en: "A curated collection of authentic daily supplications" },

  // SEARCH PAGE
  search_title: { hi: "खोजें", hinglish: "Khojein", en: "Search" },
  search_placeholder: { hi: "क़ुरआन, हदीस या दुआ खोजें...", hinglish: "Quran, Hadees ya Dua khojein...", en: "Search Quran, Hadith or Duas..." },
  search_empty: { hi: "'{query}' के लिए कोई नतीजा नहीं मिला", hinglish: "'{query}' ke liye koi nateeja nahi mila", en: "No results found for '{query}'" },
  search_results: { hi: "नतीजे", hinglish: "Nateeje", en: "Results" },

  // BOOKMARKS
  bookmarks_title: { hi: "बुकमार्क्स", hinglish: "Bookmarks", en: "Bookmarks" },
  bookmarks_subtitle: { hi: "आपकी सेव की हुई आयतें, हदीसें और दुआएं", hinglish: "Aapki save ki hui aayatein, hadeesein aur duaayein", en: "Your saved ayahs, hadiths and duas" },
  bookmarks_empty: { hi: "अभी कोई बुकमार्क नहीं। किसी आयत, हदीस या दुआ पर दिल का आइकन दबाकर यहाँ सेव करें।", hinglish: "Abhi koi bookmark nahi. Kisi aayat, hadees ya dua par dil ka icon dabaakar yahan save karein.", en: "No bookmarks yet. Tap the heart icon on any ayah, hadith or dua to save it here." },

  // DAILY VERSE + HADITH
  daily_section_title: { hi: "आज का ज्ञान", hinglish: "Aaj ka Gyaan", en: "Today's Wisdom" },
  daily_verse_title: { hi: "आज की आयत", hinglish: "Aaj ki Aayat", en: "Today's Verse" },
  daily_hadith_title: { hi: "आज की हदीस", hinglish: "Aaj ki Hadees", en: "Today's Hadith" },
  daily_loading: { hi: "लोड हो रहा है...", hinglish: "Load ho raha hai...", en: "Loading..." },

  // SEERAH
  seerah_title: { hi: "सीरत-ए-नबवी ﷺ", hinglish: "Seerat-e-Nabawi ﷺ", en: "Life of the Prophet ﷺ" },
  seerah_subtitle: { hi: "पैगंबर मुहम्मद ﷺ की ज़िंदगी के अहम वाक़ियात", hinglish: "Paigambar Muhammad ﷺ ki zindagi ke aham waqi'aat", en: "Key events in the life of Prophet Muhammad ﷺ" },
  seerah_all: { hi: "सभी", hinglish: "Sabhi", en: "All" },
  seerah_early_life: { hi: "शुरुआती ज़िंदगी", hinglish: "Shuru'aati Zindagi", en: "Early Life" },
  seerah_prophethood: { hi: "नुबुव्वत", hinglish: "Nubuwwat", en: "Prophethood" },
  seerah_makkah: { hi: "मक्का दौर", hinglish: "Makkah Daur", en: "Makkah Period" },
  seerah_madinah: { hi: "मदीना दौर", hinglish: "Madinah Daur", en: "Madinah Period" },
  seerah_final_years: { hi: "आख़िरी साल", hinglish: "Aakhri Saal", en: "Final Years" },

  // PRAYER TIMES
  prayer_title: { hi: "नमाज़ का वक़्त", hinglish: "Namaz ka Waqt", en: "Prayer Times" },
  prayer_subtitle: { hi: "अपने इलाके की नमाज़ के औक़ात देखें", hinglish: "Apne ilaaqe ki namaz ke auqaat dekhein", en: "View prayer times for your location" },
  prayer_fajr: { hi: "फ़ज्र", hinglish: "Fajr", en: "Fajr" },
  prayer_sunrise: { hi: "सूर्योदय", hinglish: "Sunrise", en: "Sunrise" },
  prayer_dhuhr: { hi: "ज़ुहर", hinglish: "Zuhr", en: "Dhuhr" },
  prayer_asr: { hi: "अस्र", hinglish: "Asr", en: "Asr" },
  prayer_maghrib: { hi: "मग़रिब", hinglish: "Maghrib", en: "Maghrib" },
  prayer_isha: { hi: "इशा", hinglish: "Isha", en: "Isha" },
  prayer_next: { hi: "अगली नमाज़", hinglish: "Agli Namaz", en: "Next Prayer" },
  prayer_location: { hi: "स्थान", hinglish: "Jagah", en: "Location" },
  prayer_detecting: { hi: "स्थान खोज रहे हैं...", hinglish: "Jagah dhoondh rahe hain...", en: "Detecting location..." },
  prayer_enter_city: { hi: "शहर का नाम डालें", hinglish: "Sheher ka naam daalein", en: "Enter city name" },
  prayer_method: { hi: "गणना विधि", hinglish: "Ganana Vidhi", en: "Calculation Method" },
  prayer_search: { hi: "खोजें", hinglish: "Khojein", en: "Search" },
  prayer_countdown: { hi: "तक", hinglish: "tak", en: "until" },
};

export function t(key: string, lang: Lang): string {
  return translations[key]?.[lang] || translations[key]?.["en"] || key;
}
