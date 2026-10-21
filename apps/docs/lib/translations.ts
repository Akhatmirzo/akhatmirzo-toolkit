import { uiTranslations } from 'fumadocs-ui/i18n';
import { i18n } from './i18n';

/**
 * Fumadocs interfeysi matnlari (qidiruv, "Sahifada", "Oldingi/Keyingi" ...).
 * Inglizcha matnlar Fumadocs'da tayyor — faqat til nomi beriladi.
 */
export const uiText = i18n
  .translations()
  .extend(uiTranslations())
  .add({
    uz: {
      displayName: "O'zbekcha",
      'Ask AI(AI chat button)': "AI'dan so'rash",
      'Back to Home(404 not found page)': 'Bosh sahifaga qaytish',
      'Choose a language(language switcher)': 'Tilni tanlang',
      'Choose a language(language switcher)(aria-label)': 'Tilni tanlang',
      'Close Banner(banner)(aria-label)': 'Bannerni yopish',
      'Close Search(search dialog)(aria-label)': 'Qidiruvni yopish',
      'Close Sidebar(aria-label)': 'Yon panelni yopish',
      'Close Sidebar(sidebar)(aria-label)': 'Yon panelni yopish',
      'Close(image zoom)(aria-label)': 'Yopish',
      'Collapse Sidebar(sidebar)(aria-label)': "Yon panelni yig'ish",
      'Copied Anchor Link(heading anchor)(aria-label)': 'Havola nusxalandi',
      'Copied Link(accordion)(aria-label)': 'Havola nusxalandi',
      'Copied Markdown(page actions)': 'Nusxalandi',
      'Copied Text(code block)(aria-label)': 'Kod nusxalandi',
      'Copy Anchor Link(heading anchor)(aria-label)': "Bo'lim havolasini nusxalash",
      'Copy Link(accordion)(aria-label)': 'Havolani nusxalash',
      'Copy Markdown(page actions)': 'Markdown nusxasi',
      'Copy Text(code block)(aria-label)': 'Kodni nusxalash',
      'Dark(theme switcher)(aria-label)': "Qorong'i",
      'Default(type table)': 'Standart',
      'Edit on GitHub(edit page)': "GitHub'da tahrirlash",
      'Hide Sidebar(sidebar)': 'Yon panelni yashirish',
      'Image Viewer(image zoom)(aria-label)': "Rasmni ko'rish",
      'Language(language switcher)': 'Til',
      'Last updated on(page footer)': 'Oxirgi yangilanish',
      'Layout Tab(layout tab trigger)': "Bo'lim",
      'Light(theme switcher)(aria-label)': "Yorug'",
      'Next Image(image zoom)(aria-label)': 'Keyingi rasm',
      'Next Page(pagination)': 'Keyingi',
      'No Headings(table of contents)': "Sarlavhalar yo'q",
      'No results found(search dialog)': 'Hech narsa topilmadi',
      'On this page(table of contents)': 'Sahifada',
      'Open Search(search trigger)(aria-label)': 'Qidiruvni ochish',
      'Open Sidebar(aria-label)': 'Yon panelni ochish',
      'Open Sidebar(sidebar)(aria-label)': 'Yon panelni ochish',
      'Open in ChatGPT(page actions)': "ChatGPT'da ochish",
      'Open in Claude(page actions)': "Claude'da ochish",
      'Open in Cursor(page actions)': "Cursor'da ochish",
      'Open in GitHub(page actions)': "GitHub'da ochish",
      'Open in Scira AI(page actions)': "Scira AI'da ochish",
      'Open(page actions)': 'Ochish',
      'Options(aria-label)': 'Parametrlar',
      'Page Not Found(404 not found page)': 'Sahifa topilmadi',
      'Parameters(type table)': 'Parametrlar',
      'Previous Image(image zoom)(aria-label)': 'Oldingi rasm',
      'Previous Page(pagination)': 'Oldingi',
      'Prop(type table)': 'Prop',
      'Read {url}, I want to ask questions about it.(page actions)':
        "{url} sahifasini o'qing, u haqida savollarim bor.",
      'Returns(type table)': 'Qaytaradi',
      'Search failed(search dialog)': "Qidiruvda xato bo'ldi",
      'Search failed, showing results for {query}(search dialog)':
        "Qidiruvda xato bo'ldi, {query} bo'yicha natijalar ko'rsatilmoqda",
      'Search(search dialog)': 'Qidirish',
      'Search(search trigger)': 'Qidirish',
      'Show Sidebar(sidebar)': "Yon panelni ko'rsatish",
      'System(theme switcher)(aria-label)': 'Tizim',
      'Table of Contents(inline table of contents)': 'Mundarija',
      'The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.(404 not found page)':
        "Siz izlagan sahifa o'chirilgan, nomi o'zgargan yoki vaqtincha mavjud emas.",
      'Theme(site menu)': 'Mavzu',
      'Toggle Menu(home layout header)(aria-label)': 'Menyuni ochish',
      'Toggle Theme(theme switcher)(aria-label)': 'Mavzuni almashtirish',
      'Type(type table)': 'Tip',
      'View as Markdown(page actions)': "Markdown ko'rinishi",
    },
    en: {
      displayName: 'English',
    },
  });
