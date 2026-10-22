import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Field } from '../field/field';
import { TagInput } from './index';

const tagTexts = () =>
  within(screen.getByRole('list'))
    .queryAllByRole('listitem')
    .map((li) => li.textContent);

function setup(props: Parameters<typeof TagInput>[0] = {}) {
  const user = userEvent.setup();
  const onValueChange = vi.fn();
  const utils = render(<TagInput aria-label="Teglar" onValueChange={onValueChange} {...props} />);
  const input = screen.getByRole(props.suggestions ? 'combobox' : 'textbox', { name: 'Teglar' });
  return { user, onValueChange, input, ...utils };
}

describe('TagInput', () => {
  it('Enter va vergul bilan teg qo‘shadi, input tozalanadi', async () => {
    const { user, input, onValueChange } = setup();
    await user.type(input, '  React {Enter}');
    expect(onValueChange).toHaveBeenLastCalledWith(['React']);
    expect(input).toHaveValue('');
    await user.type(input, 'Next.js,');
    expect(onValueChange).toHaveBeenLastCalledWith(['React', 'Next.js']);
    expect(input).toHaveValue('');
    expect(tagTexts()).toEqual(['React', 'Next.js']);
  });

  it('bo‘sh inputda Enter teg qo‘shmaydi', async () => {
    const { user, input, onValueChange } = setup();
    await user.type(input, '   {Enter}');
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('IME kompozitsiyasi paytida Enter teg qo‘shmaydi', () => {
    const { input, onValueChange } = setup();
    fireEvent.change(input, { target: { value: 'にほん' } });
    fireEvent.keyDown(input, { key: 'Enter', isComposing: true });
    expect(onValueChange).not.toHaveBeenCalled();
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onValueChange).toHaveBeenLastCalledWith(['にほん']);
  });

  it('paste "a, b, c" → 3 teg', async () => {
    const { user, input, onValueChange } = setup();
    await user.click(input);
    await user.paste('a, b, c');
    expect(onValueChange).toHaveBeenLastCalledWith(['a', 'b', 'c']);
    expect(input).toHaveValue('');
  });

  it('paste — Enter ajratuvchisi yangi qatorlarni ham bo‘ladi', async () => {
    const { user, input, onValueChange } = setup();
    await user.click(input);
    await user.paste('ali@mail.uz\nvali@mail.uz');
    expect(onValueChange).toHaveBeenLastCalledWith(['ali@mail.uz', 'vali@mail.uz']);
  });

  it('delimiters: Tab va nuqta-vergul', async () => {
    const { user, input, onValueChange } = setup({ delimiters: ['Tab', ';'] });
    await user.type(input, 'bir;');
    expect(onValueChange).toHaveBeenLastCalledWith(['bir']);
    await user.type(input, 'ikki');
    await user.tab();
    expect(onValueChange).toHaveBeenLastCalledWith(['bir', 'ikki']);
    expect(input).toHaveFocus();
    // Enter ajratuvchi emas
    await user.type(input, 'uch{Enter}');
    expect(onValueChange).toHaveBeenCalledTimes(2);
  });

  it('takrorlar katta-kichik harf farqsiz rad etiladi', async () => {
    const { user, input, onValueChange } = setup({ defaultValue: ['React'] });
    await user.type(input, 'react{Enter}');
    expect(onValueChange).not.toHaveBeenCalled();
    expect(input).toHaveValue('react');
    expect(screen.getByText("«react» allaqachon qo'shilgan")).toBeInTheDocument();
  });

  it('allowDuplicates — takror qo‘shiladi', async () => {
    const { user, input, onValueChange } = setup({
      defaultValue: ['React'],
      allowDuplicates: true,
    });
    await user.type(input, 'react{Enter}');
    expect(onValueChange).toHaveBeenLastCalledWith(['React', 'react']);
  });

  it('validate false — standart xato, matn — o‘sha xato; aria-invalid va describedby', async () => {
    const validate = (tag: string) =>
      tag.includes('@') ? (tag.endsWith('.uz') ? true : 'Faqat .uz domeni') : false;
    const { user, input, onValueChange } = setup({ validate });

    await user.type(input, 'salom{Enter}');
    expect(onValueChange).not.toHaveBeenCalled();
    const error = screen.getByText('«salom» qabul qilinmadi');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input.getAttribute('aria-describedby')).toContain(error.id);

    await user.clear(input);
    await user.type(input, 'ali@mail.com{Enter}');
    expect(screen.getByText('Faqat .uz domeni')).toBeInTheDocument();

    await user.clear(input);
    expect(input).not.toHaveAttribute('aria-invalid');
    await user.type(input, 'ali@mail.uz{Enter}');
    expect(onValueChange).toHaveBeenLastCalledWith(['ali@mail.uz']);
  });

  it('transform — matnni o‘zgartiradi', async () => {
    const { user, input, onValueChange } = setup({ transform: (raw) => raw.trim().toLowerCase() });
    await user.type(input, ' TOSHKENT {Enter}');
    expect(onValueChange).toHaveBeenLastCalledWith(['toshkent']);
  });

  it('maxTags — yetganda data-full, boshqa qo‘shilmaydi', async () => {
    const { user, input, onValueChange, container } = setup({ maxTags: 2 });
    await user.click(input);
    await user.paste('a, b, c');
    expect(onValueChange).toHaveBeenLastCalledWith(['a', 'b']);
    const box = container.querySelector('[data-slot="tag-input"]')!;
    expect(box).toHaveAttribute('data-full');
    expect(input).toHaveAttribute('readonly');
    await user.type(input, 'd{Enter}');
    expect(onValueChange).toHaveBeenCalledTimes(1);
  });

  it('Backspace: birinchisi oxirgi tegni tanlaydi, ikkinchisi o‘chiradi', async () => {
    const { user, input, onValueChange } = setup({ defaultValue: ['bir', 'ikki'] });
    await user.click(input);
    await user.keyboard('{Backspace}');
    expect(onValueChange).not.toHaveBeenCalled();
    expect(screen.getByText('ikki').closest('[data-tag-index]')).toHaveFocus();
    await user.keyboard('{Backspace}');
    expect(onValueChange).toHaveBeenLastCalledWith(['bir']);
    expect(input).toHaveFocus();
  });

  it('strelkalar teglar orasida yuradi, Delete — keyingisiga', async () => {
    const { user, input, onValueChange } = setup({ defaultValue: ['bir', 'ikki', 'uch'] });
    const tag = (t: string) => screen.getByText(t).closest('[data-tag-index]');
    await user.click(input);
    await user.keyboard('{ArrowLeft}');
    expect(tag('uch')).toHaveFocus();
    await user.keyboard('{ArrowLeft}{ArrowLeft}');
    expect(tag('bir')).toHaveFocus();
    await user.keyboard('{ArrowLeft}');
    expect(tag('bir')).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    expect(tag('ikki')).toHaveFocus();
    await user.keyboard('{Delete}');
    expect(onValueChange).toHaveBeenLastCalledWith(['bir', 'uch']);
    expect(tag('uch')).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    expect(input).toHaveFocus();
  });

  it('✕ tugmasi tegni olib tashlaydi', async () => {
    const { user, onValueChange } = setup({ defaultValue: ['React', 'Vue'] });
    await user.click(screen.getByRole('button', { name: 'Vue ni olib tashlash' }));
    expect(onValueChange).toHaveBeenLastCalledWith(['React']);
  });

  it('ikki bosish — joyida tahrirlash (Enter saqlaydi, Esc bekor qiladi)', async () => {
    const { user, input, onValueChange } = setup({ defaultValue: ['Reakt', 'Vue'] });
    await user.dblClick(screen.getByText('Reakt'));
    const editor = screen.getByRole('textbox', { name: 'Reakt' });
    expect(editor).toHaveFocus();
    await user.clear(editor);
    await user.type(editor, 'React{Enter}');
    expect(onValueChange).toHaveBeenLastCalledWith(['React', 'Vue']);
    expect(input).toHaveFocus();

    await user.dblClick(screen.getByText('Vue'));
    await user.keyboard('Svelte{Escape}');
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(tagTexts()).toEqual(['React', 'Vue']);
  });

  it('tahrirda takror — xato, tahrir davom etadi', async () => {
    const { user, onValueChange } = setup({ defaultValue: ['React', 'Vue'] });
    await user.dblClick(screen.getByText('Vue'));
    const editor = screen.getByRole('textbox', { name: 'Vue' });
    await user.clear(editor);
    await user.type(editor, 'REACT{Enter}');
    expect(onValueChange).not.toHaveBeenCalled();
    expect(editor).toBeInTheDocument();
    expect(screen.getByText(/allaqachon/)).toBeInTheDocument();
  });

  it('takliflar: kirillcha so‘rov lotincha variantni topadi, strelka + Enter', async () => {
    const { user, input, onValueChange } = setup({
      suggestions: ['Toshkent', 'Samarqand', "Farg'ona"],
    });
    await user.type(input, 'тош');
    const listbox = screen.getByRole('listbox', { name: 'Takliflar' });
    expect(
      within(listbox)
        .getAllByRole('option')
        .map((o) => o.textContent),
    ).toEqual(['Toshkent']);
    expect(input).toHaveAttribute('aria-expanded', 'true');
    await user.keyboard('{ArrowDown}');
    expect(input).toHaveAttribute('aria-activedescendant', screen.getByRole('option').id);
    await user.keyboard('{Enter}');
    expect(onValueChange).toHaveBeenLastCalledWith(['Toshkent']);
    expect(input).toHaveValue('');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('takliflar: qo‘shilganlar chiqmaydi, bosish bilan tanlash, apostrofsiz qidiruv', async () => {
    const { user, input, onValueChange } = setup({
      suggestions: ['Fargona shahri', "Farg'ona"],
      defaultValue: ['Fargona shahri'],
    });
    await user.type(input, 'фарғ');
    const options = screen.getAllByRole('option');
    expect(options.map((o) => o.textContent)).toEqual(["Farg'ona"]);
    await user.click(options[0]!);
    expect(onValueChange).toHaveBeenLastCalledWith(['Fargona shahri', "Farg'ona"]);
  });

  it('takliflar bo‘lsa ham Enter yozilgan matnni qo‘shadi (tanlanmagan bo‘lsa)', async () => {
    const { user, input, onValueChange } = setup({ suggestions: ['React'] });
    await user.type(input, 'Re{Enter}');
    expect(onValueChange).toHaveBeenLastCalledWith(['Re']);
  });

  it('name — har bir tegga yashirin input', () => {
    const { container } = render(<TagInput name="tags" defaultValue={['a', 'b']} />);
    const hidden = container.querySelectorAll('input[type="hidden"][name="tags"]');
    expect(Array.from(hidden).map((i) => (i as HTMLInputElement).value)).toEqual(['a', 'b']);
  });

  it('aria-live: qo‘shish va o‘chirish e’lon qilinadi', async () => {
    const { user, input, container } = setup();
    const status = container.querySelector('[data-slot="tag-input-status"]')!;
    expect(status).toHaveAttribute('aria-live', 'polite');
    await user.type(input, 'React{Enter}');
    expect(status).toHaveTextContent("React qo'shildi");
    await user.click(screen.getByRole('button', { name: 'React ni olib tashlash' }));
    expect(status).toHaveTextContent('React olib tashlandi');
  });

  it('teglar ro‘yxati role="list"', () => {
    render(<TagInput defaultValue={['a']} aria-label="x" />);
    expect(screen.getByRole('list')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(1);
  });

  it('Field: label, izoh, xato ulanadi; disabled — ✕ yo‘q', () => {
    render(
      <Field label="Teglar" description="Enter bilan qo‘shing" error="Kamida bitta teg" disabled>
        <TagInput defaultValue={['a']} />
      </Field>,
    );
    const input = screen.getByRole('textbox', { name: 'Teglar' });
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription(/Enter bilan/);
    expect(input).toBeDisabled();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
