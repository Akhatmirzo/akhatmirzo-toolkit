/**
 * "Bozorcha" do'konining statik ma'lumotlari: mahsulotlar, hududlar, yetkazib berish va to'lov
 * usullari. Backend yo'q — hammasi shu faylda.
 */

export type Tone = 'primary' | 'info' | 'success' | 'warning' | 'danger';

export type ProductIcon =
  | 'headphones'
  | 'watch'
  | 'battery'
  | 'shirt'
  | 'scarf'
  | 'shoes'
  | 'teaset'
  | 'kettle'
  | 'lamp'
  | 'book'
  | 'notebook';

export type CategoryId = 'electronics' | 'clothes' | 'home' | 'books';

export interface Product {
  id: string;
  name: string;
  category: CategoryId;
  price: number;
  /** Chegirmadan oldingi narx */
  oldPrice?: number;
  /** Rang yoki o'lcham variantlari */
  variants?: string[];
  variantLabel?: string;
  icon: ProductIcon;
  tone: Tone;
  rating: number;
  reviews: number;
  stock: number;
  /** Ommaboplik — saralash uchun */
  sold: number;
  tag?: string;
}

export const categories: { id: CategoryId | 'all'; label: string }[] = [
  { id: 'all', label: 'Barchasi' },
  { id: 'electronics', label: 'Elektronika' },
  { id: 'clothes', label: 'Kiyim' },
  { id: 'home', label: "Uy-ro'zg'or" },
  { id: 'books', label: 'Kitoblar' },
];

export const products: Product[] = [
  {
    id: 'p-headphones',
    name: 'SoundPro X2 simsiz quloqchin',
    category: 'electronics',
    price: 389_000,
    oldPrice: 459_000,
    variants: ['Qora', 'Oq'],
    variantLabel: 'Rang',
    icon: 'headphones',
    tone: 'primary',
    rating: 4.8,
    reviews: 312,
    stock: 14,
    sold: 1240,
    tag: 'Xit',
  },
  {
    id: 'p-watch',
    name: 'Fit Band 5 aqlli soat',
    category: 'electronics',
    price: 459_000,
    variants: ['Qora', 'Pushti', 'Yashil'],
    variantLabel: 'Rang',
    icon: 'watch',
    tone: 'info',
    rating: 4.6,
    reviews: 198,
    stock: 9,
    sold: 860,
  },
  {
    id: 'p-powerbank',
    name: 'Powerbank 20 000 mAh',
    category: 'electronics',
    price: 219_000,
    icon: 'battery',
    tone: 'success',
    rating: 4.7,
    reviews: 421,
    stock: 30,
    sold: 1530,
  },
  {
    id: 'p-tshirt',
    name: 'Paxta futbolka "Toshkent"',
    category: 'clothes',
    price: 129_000,
    variants: ['S', 'M', 'L', 'XL'],
    variantLabel: "O'lcham",
    icon: 'shirt',
    tone: 'warning',
    rating: 4.5,
    reviews: 87,
    stock: 40,
    sold: 640,
    tag: 'Yangi',
  },
  {
    id: 'p-scarf',
    name: "Atlas naqshli ipak ro'mol",
    category: 'clothes',
    price: 189_000,
    variants: ["Ko'k", 'Qizil'],
    variantLabel: 'Rang',
    icon: 'scarf',
    tone: 'danger',
    rating: 4.9,
    reviews: 64,
    stock: 6,
    sold: 310,
  },
  {
    id: 'p-sneakers',
    name: 'Yengil Qadam krossovkasi',
    category: 'clothes',
    price: 549_000,
    oldPrice: 649_000,
    variants: ['40', '41', '42', '43', '44'],
    variantLabel: "O'lcham",
    icon: 'shoes',
    tone: 'primary',
    rating: 4.4,
    reviews: 143,
    stock: 11,
    sold: 520,
  },
  {
    id: 'p-teaset',
    name: "Rishton sopol choynak to'plami",
    category: 'home',
    price: 279_000,
    icon: 'teaset',
    tone: 'info',
    rating: 4.9,
    reviews: 236,
    stock: 8,
    sold: 980,
    tag: "Qo'lda yasalgan",
  },
  {
    id: 'p-kettle',
    name: 'Elektr choynak 1,7 L',
    category: 'home',
    price: 249_000,
    variants: ['Kumush', 'Qora'],
    variantLabel: 'Rang',
    icon: 'kettle',
    tone: 'success',
    rating: 4.3,
    reviews: 119,
    stock: 22,
    sold: 450,
  },
  {
    id: 'p-lamp',
    name: "LED stol chirog'i",
    category: 'home',
    price: 159_000,
    oldPrice: 189_000,
    icon: 'lamp',
    tone: 'warning',
    rating: 4.6,
    reviews: 75,
    stock: 17,
    sold: 290,
  },
  {
    id: 'p-otkan-kunlar',
    name: '"O\'tkan kunlar" — Abdulla Qodiriy',
    category: 'books',
    price: 69_000,
    icon: 'book',
    tone: 'success',
    rating: 5,
    reviews: 502,
    stock: 50,
    sold: 2100,
    tag: 'Klassika',
  },
  {
    id: 'p-sariq-dev',
    name: '"Sariq devni minib" — X. To\'xtaboyev',
    category: 'books',
    price: 55_000,
    icon: 'book',
    tone: 'danger',
    rating: 4.9,
    reviews: 288,
    stock: 35,
    sold: 1320,
  },
  {
    id: 'p-planner',
    name: 'Kundalik-rejalashtirgich 2027',
    category: 'books',
    price: 49_000,
    variants: ["Ko'k", 'Qum rang'],
    variantLabel: 'Muqova',
    icon: 'notebook',
    tone: 'primary',
    rating: 4.7,
    reviews: 58,
    stock: 3,
    sold: 210,
  },
];

export const productById = new Map(products.map((p) => [p.id, p]));

/* ---------- Savatcha ---------- */

export interface CartItem {
  /** `productId` + variant — bir mahsulotning turli variantlari alohida qator */
  key: string;
  productId: string;
  variant?: string;
  qty: number;
}

export const cartKey = (productId: string, variant?: string) =>
  variant ? `${productId}:${variant}` : productId;

/** Demo boshlanishida savatchada turadigan mahsulotlar */
export const initialCart: CartItem[] = [
  { key: 'p-headphones:Qora', productId: 'p-headphones', variant: 'Qora', qty: 1 },
  { key: 'p-teaset', productId: 'p-teaset', qty: 1 },
  { key: 'p-otkan-kunlar', productId: 'p-otkan-kunlar', qty: 2 },
];

/** Promokodlar: kod → chegirma ulushi */
export const promoCodes: Record<string, { percent: number; label: string }> = {
  SALOM10: { percent: 10, label: '10% chegirma' },
};

/* ---------- Hududlar ---------- */

export interface Region {
  id: string;
  name: string;
  districts: string[];
}

export const regions: Region[] = [
  {
    id: 'tashkent-city',
    name: 'Toshkent shahri',
    districts: [
      'Bektemir',
      'Chilonzor',
      'Mirobod',
      "Mirzo Ulug'bek",
      'Olmazor',
      'Sergeli',
      'Shayxontohur',
      'Uchtepa',
      'Yakkasaroy',
      'Yangihayot',
      'Yashnobod',
      'Yunusobod',
    ],
  },
  {
    id: 'tashkent',
    name: 'Toshkent viloyati',
    districts: ['Angren', 'Bekobod', 'Chirchiq', "Bo'stonliq", 'Nurafshon', 'Olmaliq', 'Zangiota'],
  },
  {
    id: 'andijan',
    name: 'Andijon viloyati',
    districts: ['Andijon shahri', 'Asaka', 'Xonobod', 'Marhamat', 'Shahrixon', "Qo'rg'ontepa"],
  },
  {
    id: 'fergana',
    name: "Farg'ona viloyati",
    districts: ["Farg'ona shahri", "Marg'ilon", "Qo'qon", 'Quvasoy', 'Rishton', 'Oltiariq'],
  },
  {
    id: 'namangan',
    name: 'Namangan viloyati',
    districts: ['Namangan shahri', 'Chust', 'Kosonsoy', 'Pop', "To'raqo'rg'on", "Uchqo'rg'on"],
  },
  {
    id: 'samarkand',
    name: 'Samarqand viloyati',
    districts: ['Samarqand shahri', "Kattaqo'rg'on", 'Urgut', 'Payariq', "Bulung'ur", 'Ishtixon'],
  },
  {
    id: 'bukhara',
    name: 'Buxoro viloyati',
    districts: ['Buxoro shahri', 'Kogon', "G'ijduvon", 'Vobkent', "Qorako'l", 'Romitan'],
  },
  {
    id: 'navoi',
    name: 'Navoiy viloyati',
    districts: ['Navoiy shahri', 'Zarafshon', 'Karmana', 'Nurota', 'Uchquduq'],
  },
  {
    id: 'kashkadarya',
    name: 'Qashqadaryo viloyati',
    districts: ['Qarshi', 'Shahrisabz', 'Kitob', "G'uzor", 'Koson', 'Muborak'],
  },
  {
    id: 'surkhandarya',
    name: 'Surxondaryo viloyati',
    districts: ['Termiz', 'Denov', 'Sherobod', "Jarqo'rg'on", "Sho'rchi", 'Boysun'],
  },
  {
    id: 'jizzakh',
    name: 'Jizzax viloyati',
    districts: ['Jizzax shahri', "G'allaorol", 'Zomin', 'Paxtakor', 'Forish'],
  },
  {
    id: 'syrdarya',
    name: 'Sirdaryo viloyati',
    districts: ['Guliston', 'Yangiyer', 'Shirin', 'Boyovut', 'Sardoba'],
  },
  {
    id: 'khorezm',
    name: 'Xorazm viloyati',
    districts: ['Urganch', 'Xiva', 'Xonqa', 'Shovot', "Bog'ot", 'Gurlan'],
  },
  {
    id: 'karakalpakstan',
    name: "Qoraqalpog'iston Respublikasi",
    districts: ['Nukus', "Xo'jayli", "To'rtko'l", 'Beruniy', "Mo'ynoq", 'Chimboy'],
  },
];

export const regionById = new Map(regions.map((r) => [r.id, r]));

/* ---------- Yetkazib berish ---------- */

export type DeliveryMethod = 'courier' | 'post' | 'pickup';

export const COURIER_FEE = 25_000;
export const POST_FEE = 15_000;
/** Shu summadan boshlab kuryer bepul */
export const FREE_COURIER_FROM = 500_000;

export const deliveryMethods: {
  id: DeliveryMethod;
  label: string;
  description: string;
}[] = [
  { id: 'courier', label: 'Kuryer', description: 'Tanlangan kun va vaqtda eshigingizgacha' },
  { id: 'post', label: "O'zbekiston pochtasi", description: "3–5 ish kunida yaqin bo'limga" },
  { id: 'pickup', label: 'Olib ketish', description: 'Toshkentdagi topshirish punktidan, bepul' },
];

export const timeSlots = [
  { id: '09-12', label: '09:00 – 12:00', startHour: 9 },
  { id: '12-15', label: '12:00 – 15:00', startHour: 12 },
  { id: '15-18', label: '15:00 – 18:00', startHour: 15 },
  { id: '18-21', label: '18:00 – 21:00', startHour: 18 },
];

export const pickupPoints = [
  {
    id: 'chilonzor',
    name: 'Chilonzor punkti',
    address: "Bunyodkor shoh ko'chasi, 7 (Chilonzor metro yonida)",
    hours: 'Du–Sh, 09:00–20:00',
  },
  {
    id: 'yunusobod',
    name: 'Yunusobod punkti',
    address: "Amir Temur shoh ko'chasi, 108 (Mega Planet)",
    hours: 'Har kuni, 10:00–22:00',
  },
  {
    id: 'ulugbek',
    name: "Mirzo Ulug'bek punkti",
    address: "Buyuk Ipak Yo'li ko'chasi, 154",
    hours: 'Du–Sh, 09:00–19:00',
  },
];

/* ---------- To'lov ---------- */

export type PaymentMethod = 'card' | 'click' | 'payme' | 'cash';

export const paymentMethods: { id: PaymentMethod; label: string; description: string }[] = [
  { id: 'card', label: 'Bank kartasi', description: 'Uzcard, Humo, Visa, Mastercard' },
  { id: 'click', label: 'Click', description: 'Click hamyoni orqali, SMS tasdiq bilan' },
  { id: 'payme', label: 'Payme', description: 'Payme hamyoni orqali, SMS tasdiq bilan' },
  { id: 'cash', label: 'Naqd pul', description: 'Qabul qilganda kuryerga yoki punktda' },
];

/** Demo uchun: SMS kod va sinov kartalari */
export const DEMO_OTP = '123456';
export const TEST_CARDS = {
  success: { number: '8600492133728812', holder: 'AZIZ KARIMOV', expiry: '0829' },
  declined: { number: '8600000000000007', holder: 'AZIZ KARIMOV', expiry: '1128' },
};

/* ---------- Buyurtma ---------- */

export const orderStages: Record<DeliveryMethod, string[]> = {
  courier: [
    'Buyurtma qabul qilindi',
    "To'lov tasdiqlandi",
    "Omborda yig'ilmoqda",
    'Kuryerga topshirildi',
    'Yetkazib berildi',
  ],
  post: [
    'Buyurtma qabul qilindi',
    "To'lov tasdiqlandi",
    "Omborda yig'ilmoqda",
    'Pochtaga topshirildi',
    "Bo'limga yetib keldi",
  ],
  pickup: [
    'Buyurtma qabul qilindi',
    "To'lov tasdiqlandi",
    "Omborda yig'ilmoqda",
    'Punktga yetkazildi',
    'Mijoz olib ketdi',
  ],
};
