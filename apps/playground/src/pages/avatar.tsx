import { Avatar, AvatarGroup, type AvatarSize } from '@akhatmirzo/ui';
import { Code, DemoPage, DemoRow, DemoSection } from '../demo';
import type { PageMeta } from '../pages';

export const meta: PageMeta = { title: 'Avatar', group: "Ko'rsatish", order: 2 };

const sizes: { size: AvatarSize; px: number }[] = [
  { size: 'xs', px: 24 },
  { size: 'sm', px: 32 },
  { size: 'md', px: 40 },
  { size: 'lg', px: 48 },
  { size: 'xl', px: 64 },
];

const people = [
  'Sarvar Abduxoliqov',
  'Jasur Karimov',
  'Malika Rahimova',
  'Dilnoza Yusupova',
  'Rustam Qodirov',
  "O'tkir Hoshimov",
  'Gulnora Aliyeva',
  'Bekzod Toshmatov',
];

/* Ma'lumot URI — tarmoqsiz ishlaydigan namuna rasm */
const photo =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="slateblue"/><stop offset="1" stop-color="steelblue"/></linearGradient></defs><rect width="64" height="64" fill="url(#g)"/><circle cx="32" cy="26" r="11" fill="white" fill-opacity=".85"/><path d="M12 60c3-11 11-16 20-16s17 5 20 16z" fill="white" fill-opacity=".85"/></svg>',
  );

export default function Page() {
  return (
    <DemoPage
      title="Avatar"
      description="Foydalanuvchi rasmi yoki bosh harflari. Rang ismdan deterministik — bir ism doim bir rang."
    >
      <DemoSection
        title="Bosh harflar"
        description="Rang faqat tokenlardagi soft/foreground juftliklaridan — dark mode'da ham to'g'ri"
      >
        <DemoRow>
          {people.map((p) => (
            <Avatar key={p} name={p} />
          ))}
        </DemoRow>
      </DemoSection>

      <DemoSection title="O'lchamlar" description="xs / sm / md (default) / lg / xl">
        <DemoRow label="Bosh harflar">
          {sizes.map(({ size }) => (
            <Avatar key={size} size={size} name="Sarvar Abduxoliqov" />
          ))}
        </DemoRow>
        <DemoRow label="Rasm">
          {sizes.map(({ size }) => (
            <Avatar key={size} size={size} src={photo} alt="Namuna rasm" />
          ))}
        </DemoRow>
        <DemoRow label="O'lcham (px)">
          {sizes.map(({ size, px }) => (
            <span key={size} className="w-16 text-xs text-text-muted">
              {size} · {px}
            </span>
          ))}
        </DemoRow>
      </DemoSection>

      <DemoSection title="Shakl" description={<Code>shape="circle" | "square"</Code>}>
        <DemoRow label="circle (default)">
          {sizes.map(({ size }) => (
            <Avatar key={size} size={size} name="Jasur Karimov" />
          ))}
        </DemoRow>
        <DemoRow label="square">
          {sizes.map(({ size }) => (
            <Avatar key={size} size={size} shape="square" name="Jasur Karimov" />
          ))}
        </DemoRow>
      </DemoSection>

      <DemoSection title="Holat" description="online / offline / busy — burchakdagi nuqta">
        <DemoRow>
          <Avatar name="Sarvar Abduxoliqov" status="online" />
          <Avatar name="Malika Rahimova" status="offline" />
          <Avatar name="Rustam Qodirov" status="busy" />
          <Avatar src={photo} alt="Namuna rasm" status="online" size="lg" />
          <Avatar name="Jasur Karimov" shape="square" status="busy" size="lg" />
          <Avatar name="Dilnoza Yusupova" status="online" size="xl" />
        </DemoRow>
      </DemoSection>

      <DemoSection
        title="Rasm yuklanmasa"
        description="Avtomatik bosh harflarga o'tadi; ism ham bo'lmasa — ikonka"
      >
        <DemoRow>
          <Avatar src="/mavjud-emas.png" name="Gulnora Aliyeva" />
          <Avatar src="/mavjud-emas.png" name="Bekzod Toshmatov" size="lg" />
          <Avatar />
          <Avatar size="lg" shape="square" />
        </DemoRow>
      </DemoSection>

      <DemoSection title="AvatarGroup" description={<Code>max</Code>}>
        <DemoRow label="max={3}">
          <AvatarGroup max={3} aria-label="Ishtirokchilar">
            {people.map((p) => (
              <Avatar key={p} name={p} />
            ))}
          </AvatarGroup>
        </DemoRow>
        {sizes.map(({ size }) => (
          <DemoRow key={size} label={size}>
            <AvatarGroup max={4} size={size}>
              {people.map((p) => (
                <Avatar key={p} name={p} />
              ))}
            </AvatarGroup>
          </DemoRow>
        ))}
        <DemoRow label="square, rasm bilan">
          <AvatarGroup max={4} shape="square" size="lg">
            <Avatar src={photo} alt="Namuna rasm" />
            {people.map((p) => (
              <Avatar key={p} name={p} />
            ))}
          </AvatarGroup>
        </DemoRow>
      </DemoSection>
    </DemoPage>
  );
}
