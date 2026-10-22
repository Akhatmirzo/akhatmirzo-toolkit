import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { zUz } from './index';

function errorOf(schema: z.ZodType, input: unknown): string | undefined {
  const r = schema.safeParse(input);
  return r.success ? undefined : r.error.issues[0]?.message;
}

describe('zUz', () => {
  it('phone: tozalangan 998XXXXXXXXX qaytaradi', () => {
    expect(zUz.phone().parse('+998 90 123-45-67')).toBe('998901234567');
    expect(zUz.phone().parse('901234567')).toBe('998901234567');
    expect(zUz.phone().parse('998901234567')).toBe('998901234567');
    expect(errorOf(zUz.phone(), '')).toBe('Telefon raqamini kiriting');
    expect(errorOf(zUz.phone(), undefined)).toBe('Telefon raqamini kiriting');
    expect(errorOf(zUz.phone(), '+998 12 123 45 67')).toBe("Telefon raqami noto'g'ri");
    expect(errorOf(zUz.phone(), 12)).toBe("Telefon raqami noto'g'ri");
  });

  it('messages opsiyasi standart matnni almashtiradi', () => {
    const s = zUz.phone({ messages: { invalid: 'Bad phone' } });
    expect(errorOf(s, '123')).toBe('Bad phone');
    expect(errorOf(s, '')).toBe('Telefon raqamini kiriting');
  });

  it('pinfl: sana tekshiruvi va ixtiyoriy checksum', () => {
    expect(zUz.pinfl().parse('31503 90123 4567')).toBe('31503901234567');
    expect(errorOf(zUz.pinfl(), '33102901234567')).toBe("JShShIR noto'g'ri");
    expect(errorOf(zUz.pinfl(), ' ')).toBe('JShShIRni kiriting');
    // 7-3-1 og'irliklar bo'yicha yig'indi 132 → nazorat raqami 2
    expect(zUz.pinfl({ checksum: true }).safeParse('31503901234562').success).toBe(true);
    expect(zUz.pinfl({ checksum: true }).safeParse('31503901234567').success).toBe(false);
  });

  it('inn, passport, carPlate, bankAccount, mfo', () => {
    expect(zUz.inn().parse('123 456 789')).toBe('123456789');
    expect(errorOf(zUz.inn(), '012345678')).toBe("STIR noto'g'ri");
    expect(zUz.passport().parse('aa 123-45-67')).toBe('AA1234567');
    expect(errorOf(zUz.passport(), 'A1234567')).toBe("Pasport seriya-raqami noto'g'ri");
    expect(zUz.carPlate().parse('01 a 123 bc')).toBe('01A123BC');
    expect(zUz.carPlate().parse('30 123 abc')).toBe('30123ABC');
    expect(errorOf(zUz.carPlate(), '01 1234 AB')).toBe("Avtomobil raqami noto'g'ri");
    expect(zUz.bankAccount().parse('2020 8000 9000 1234 5001')).toBe('20208000900012345001');
    expect(errorOf(zUz.bankAccount(), '2020')).toBe(
      "Hisob raqami 20 ta raqamdan iborat bo'lishi kerak",
    );
    expect(zUz.mfo().parse('00014')).toBe('00014');
    expect(errorOf(zUz.mfo(), '')).toBe('MFOni kiriting');
  });

  it('card: Luhn', () => {
    expect(zUz.card().parse('4111 1111 1111 1111')).toBe('4111111111111111');
    expect(errorOf(zUz.card(), '4111 1111 1111 1112')).toBe("Karta raqami noto'g'ri");
  });

  it('email', () => {
    expect(zUz.email().parse(' sarvar@mail.uz ')).toBe('sarvar@mail.uz');
    expect(errorOf(zUz.email(), 'sarvar@mail')).toBe("Email manzili noto'g'ri");
    expect(errorOf(zUz.email(), '')).toBe('Email manzilini kiriting');
  });

  it('password: minScore', () => {
    expect(zUz.password().parse('Parol123!')).toBe('Parol123!');
    expect(errorOf(zUz.password(), 'parol')).toMatch(/Parol juda oddiy/);
    expect(errorOf(zUz.password(), '')).toBe('Parolni kiriting');
    expect(zUz.password({ minScore: 0 }).safeParse('a').success).toBe(true);
    expect(zUz.password({ minScore: 4 }).safeParse('Parol123!').success).toBe(false);
  });

  it('money: son yoki matn → number, min/max', () => {
    expect(zUz.money().parse('1 250 000')).toBe(1250000);
    expect(zUz.money().parse("1 250 000 so'm")).toBe(1250000);
    expect(zUz.money().parse('1 250,5')).toBe(1250.5);
    expect(zUz.money().parse(5000)).toBe(5000);
    expect(zUz.money().parse('1,250,000.50')).toBe(1250000.5);
    expect(zUz.money().parse('1.250.000,50')).toBe(1250000.5);
    expect(zUz.money().parse('1,250,000')).toBe(1250000);
    expect(zUz.money().parse('1 250 000')).toBe(1250000);
    expect(zUz.money().parse('-500')).toBe(-500);
    expect(zUz.money().parse('−500')).toBe(-500);
    expect(errorOf(zUz.money({ min: 0 }), '-500')).toBe("Eng kam summa — 0 so'm");
    expect(errorOf(zUz.money(), '1,2,3')).toBe("Summa noto'g'ri");
    expect(errorOf(zUz.money(), '1,25,000.5')).toBe("Summa noto'g'ri");
    expect(errorOf(zUz.money(), '   ')).toBe('Summani kiriting');
    expect(errorOf(zUz.money(), null)).toBe('Summani kiriting');
    expect(errorOf(zUz.money(), '')).toBe('Summani kiriting');
    expect(errorOf(zUz.money(), '12abc')).toBe("Summa noto'g'ri");
    expect(errorOf(zUz.money({ min: 1000 }), 500)).toBe("Eng kam summa — 1 000 so'm");
    expect(errorOf(zUz.money({ max: 10 }), '11')).toMatch(/Eng ko'p summa/);
    expect(errorOf(zUz.money({ min: 10, messages: { min: (n) => `>= ${n}` } }), 1)).toBe('>= 10');
  });

  it('region: UZ_REGIONS id', () => {
    expect(zUz.region().parse('samarkand')).toBe('samarkand');
    expect(errorOf(zUz.region(), '')).toBe('Hududni tanlang');
    expect(errorOf(zUz.region(), 'moscow')).toBe("Hudud noto'g'ri");
  });

  it('z.object ichida va kirish/natija turlari', () => {
    const schema = z.object({ phone: zUz.phone(), amount: zUz.money() });
    const out = schema.parse({ phone: '90 123 45 67', amount: '1 000' });
    expect(out).toEqual({ phone: '998901234567', amount: 1000 });
    type In = z.input<typeof schema>;
    type Out = z.output<typeof schema>;
    const input: In = { phone: '', amount: null };
    const output: Out = { phone: '998901234567', amount: 1 };
    expect(input.amount).toBeNull();
    expect(output.amount).toBe(1);
  });
});
