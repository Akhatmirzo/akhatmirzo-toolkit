'use client';

import { Avatar } from '@akhatmirzo/ui';
import { useMediaQuery } from '@akhatmirzo/hooks';
import { BadgeCheck, Fingerprint, ShieldCheck, Smartphone } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/cn';
import { testimonials } from './data';
import { Logo } from './logo';

const features = [
  { icon: Smartphone, text: 'Telefon raqam bilan bir daqiqada kirish' },
  { icon: ShieldCheck, text: 'Har bir kirish SMS kod bilan tasdiqlanadi' },
  { icon: Fingerprint, text: "Ma'lumotlaringiz shifrlangan holda saqlanadi" },
];

/** Chap ustun: gradient fon, SVG illyustratsiya, shior va aylanib turuvchi mijoz fikri */
export function BrandPanel() {
  return (
    <aside
      aria-label="Kalit haqida"
      className="relative isolate hidden overflow-hidden bg-primary text-primary-foreground lg:sticky lg:top-11 lg:flex lg:self-start lg:h-[calc(100dvh-2.75rem)] lg:flex-col"
    >
      <Backdrop />
      <div className="relative flex min-h-0 flex-1 flex-col gap-8 p-10 xl:px-14">
        <Logo inverted />
        <div className="max-w-md">
          <p className="text-sm font-semibold tracking-wide uppercase opacity-75">
            Yagona hisob — barcha xizmatlar
          </p>
          <p className="mt-3 text-4xl leading-tight font-bold tracking-tight text-balance">
            Bir kalit bilan barcha eshiklarni oching.
          </p>
          <ul className="mt-8 flex flex-col gap-3">
            {features.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-sm">
                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary-foreground/15">
                  <Icon aria-hidden="true" className="size-4" />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>
        <Illustration />
        <Testimonials />
      </div>
    </aside>
  );
}

/** Yumshoq yorug'lik dog'lari va nuqtali to'r (faqat CSS) */
function Backdrop() {
  return (
    <div aria-hidden="true" className="absolute inset-0 -z-10">
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary-hover" />
      <div className="absolute -top-32 -right-24 size-[28rem] rounded-full bg-primary-foreground/15 blur-3xl" />
      <div className="absolute -bottom-40 -left-24 size-[26rem] rounded-full bg-info/30 blur-3xl" />
      <div className="absolute inset-0 [background-image:radial-gradient(var(--ak-primary-foreground)_1px,transparent_1px)] [background-size:22px_22px] opacity-[0.12] [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />
    </div>
  );
}

/** Telefon, SMS kod va qalqon — rasm faylsiz, SVG */
function Illustration() {
  return (
    // Past ekranlarda illyustratsiya qisqaradi yoki yashiriladi — matn va fikr doim ko'rinadi
    <div
      aria-hidden="true"
      className="flex min-h-40 flex-1 items-center justify-center [@media(max-height:820px)]:hidden"
    >
      <svg viewBox="0 0 360 240" className="h-full max-h-60 w-full max-w-sm" fill="none">
        {/* Telefon */}
        <rect
          x="120"
          y="14"
          width="120"
          height="212"
          rx="22"
          className="fill-primary-foreground/10 stroke-primary-foreground/40"
          strokeWidth="2"
        />
        <rect x="160" y="26" width="40" height="6" rx="3" className="fill-primary-foreground/30" />
        <rect x="136" y="52" width="88" height="10" rx="5" className="fill-primary-foreground/50" />
        <rect x="136" y="70" width="60" height="8" rx="4" className="fill-primary-foreground/25" />
        {/* OTP katakchalari */}
        {[0, 1, 2, 3].map((i) => (
          <g key={i}>
            <rect
              x={136 + i * 23}
              y="98"
              width="19"
              height="26"
              rx="6"
              className={
                i < 3
                  ? 'fill-primary-foreground'
                  : 'fill-primary-foreground/15 stroke-primary-foreground/50'
              }
              strokeWidth="1.5"
            />
            {i < 3 && <circle cx={145.5 + i * 23} cy="111" r="3" className="fill-primary" />}
          </g>
        ))}
        <rect x="136" y="142" width="88" height="22" rx="11" className="fill-primary-foreground" />
        <rect x="160" y="150" width="40" height="6" rx="3" className="fill-primary/60" />
        <rect x="150" y="180" width="60" height="6" rx="3" className="fill-primary-foreground/20" />
        {/* SMS pufakchasi */}
        <g className="motion-safe:animate-[auth-float_6s_ease-in-out_infinite]">
          <rect x="18" y="56" width="104" height="54" rx="14" className="fill-primary-foreground" />
          <path d="M100 110 L112 122 L108 108 Z" className="fill-primary-foreground" />
          <rect x="30" y="68" width="44" height="7" rx="3.5" className="fill-primary/40" />
          <text x="30" y="98" className="fill-primary text-[17px] font-bold tracking-[0.2em]">
            123 456
          </text>
        </g>
        {/* Qalqon */}
        <g className="motion-safe:animate-[auth-float_7s_ease-in-out_infinite_1s]">
          <circle cx="292" cy="160" r="40" className="fill-success" />
          <circle
            cx="292"
            cy="160"
            r="40"
            className="stroke-primary-foreground/60"
            strokeWidth="2"
          />
          <path
            d="M276 160 l11 11 l21 -22"
            className="stroke-primary-foreground"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
        <circle cx="300" cy="50" r="6" className="fill-primary-foreground/40" />
        <circle cx="54" cy="190" r="10" className="fill-primary-foreground/20" />
      </svg>
      <style>{`@keyframes auth-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}`}</style>
    </div>
  );
}

const ROTATE_MS = 7000;

function Testimonials() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const item = testimonials[index] ?? testimonials[0]!;

  useEffect(() => {
    if (paused || reduceMotion) return;
    const t = setTimeout(() => setIndex((i) => (i + 1) % testimonials.length), ROTATE_MS);
    return () => clearTimeout(t);
  }, [index, paused, reduceMotion]);

  return (
    <figure
      className="rounded-2xl border border-primary-foreground/20 bg-primary-foreground/10 p-6 backdrop-blur-sm"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="flex gap-0.5" aria-label="5 yulduzdan 5">
        {Array.from({ length: 5 }, (_, i) => (
          <svg key={i} viewBox="0 0 20 20" aria-hidden="true" className="size-4 fill-warning">
            <path d="m10 1.5 2.6 5.3 5.9.9-4.3 4.1 1 5.8L10 14.9l-5.2 2.7 1-5.8L1.5 7.7l5.9-.9Z" />
          </svg>
        ))}
      </div>
      <blockquote
        key={index}
        className="mt-3 text-base leading-relaxed motion-safe:animate-[auth-fade_400ms_ease-out]"
      >
        “{item.quote}”
      </blockquote>
      <figcaption className="mt-5 flex items-center gap-3">
        <Avatar name={item.name} size="md" className="ring-2 ring-primary-foreground/30" />
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1 text-sm font-semibold">
            {item.name}
            <BadgeCheck aria-hidden="true" className="size-4 opacity-80" />
          </p>
          <p className="text-xs opacity-75">{item.role}</p>
        </div>
        <div className="flex gap-1.5">
          {testimonials.map((t, i) => (
            <button
              key={t.name}
              type="button"
              aria-label={`${i + 1}-fikr: ${t.name}`}
              aria-current={i === index || undefined}
              onClick={() => setIndex(i)}
              className={cn(
                'focus-ring h-1.5 cursor-pointer rounded-full bg-primary-foreground transition-all duration-slow',
                i === index ? 'w-6' : 'w-1.5 opacity-40 hover:opacity-70',
              )}
            />
          ))}
        </div>
      </figcaption>
      <style>{`@keyframes auth-fade{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}`}</style>
    </figure>
  );
}
