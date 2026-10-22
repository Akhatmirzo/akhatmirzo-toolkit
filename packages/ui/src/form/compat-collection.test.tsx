import { act, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { ColorPicker } from '../components/color-picker';
import { FileUpload, type FileUploadItem } from '../components/file-upload';
import { OtpInput } from '../components/otp-input';
import { TagInput } from '../components/tag-input';
import { expectErrorAndFocus, renderForm } from '../test/form-harness';
import { FormField } from './form-field';

describe("FormField — ro'yxat, rang, kod, fayl", () => {
  it('TagInput: string[]', async () => {
    const { user, form, value, submit } = renderForm(
      <FormField name="tags" label="Teglar">
        <TagInput />
      </FormField>,
      {
        schema: z.object({ tags: z.array(z.string()).min(1, 'Kamida bitta teg').max(2) }),
        defaultValues: { tags: [] },
      },
    );
    const input = screen.getByRole('textbox', { name: 'Teglar' });
    await submit();
    await expectErrorAndFocus('Kamida bitta teg');
    expect(input).toHaveFocus();
    await user.type(input, 'React{Enter}Vue{Enter}');
    expect(value('tags')).toEqual(['React', 'Vue']);
    expect(screen.getByText('React')).toBeInTheDocument();
    act(() => form().reset());
    await waitFor(() => expect(screen.queryByText('React')).not.toBeInTheDocument());
    act(() => form().setValue('tags', ['Next.js']));
    expect(await screen.findByText('Next.js')).toBeInTheDocument();
  });

  it('ColorPicker: hex satr', async () => {
    const { user, form, value, submit } = renderForm(
      <FormField name="color" label="Brend rangi">
        <ColorPicker />
      </FormField>,
      {
        schema: z.object({
          color: z.string().refine((c) => c.toLowerCase() !== '#000000', 'Qora rang mumkin emas'),
        }),
        defaultValues: { color: '#000000' },
      },
    );
    const trigger = screen.getByRole('button', { name: /Brend rangi/ });
    expect(trigger).toHaveTextContent('#000000');
    await submit();
    await expectErrorAndFocus('Qora rang mumkin emas');
    expect(trigger).toHaveFocus();
    await user.click(trigger);
    const hex = screen.getByRole('textbox', { name: 'HEX' });
    await user.clear(hex);
    await user.type(hex, '#10b981');
    expect(String(value('color')).toLowerCase()).toBe('#10b981');
    await user.keyboard('{Escape}');
    act(() => form().reset());
    await waitFor(() => expect(trigger).toHaveTextContent('#000000'));
  });

  it('OtpInput: satr', async () => {
    const { user, form, value, submit } = renderForm(
      <FormField name="code" label="SMS kod">
        <OtpInput />
      </FormField>,
      {
        schema: z.object({ code: z.string().length(6, "Kodni to'liq kiriting") }),
        defaultValues: { code: '' },
      },
    );
    const cells = () => screen.getAllByRole('textbox') as HTMLInputElement[];
    await submit();
    await expectErrorAndFocus("Kodni to'liq kiriting");
    expect(cells()[0]).toHaveFocus();
    await user.keyboard('123456');
    expect(value('code')).toBe('123456');
    act(() => form().reset());
    await waitFor(() =>
      expect(
        cells()
          .map((c) => c.value)
          .join(''),
      ).toBe(''),
    );
    act(() => form().setValue('code', '987'));
    await waitFor(() =>
      expect(
        cells()
          .map((c) => c.value)
          .join(''),
      ).toBe('987'),
    );
  });

  it("FileUpload: boshqarilmaydi — onFilesChange, reset'da qayta yaratiladi", async () => {
    const { user, form, value, submit, container } = renderForm(
      <FormField name="files" label="Hujjat">
        <FileUpload />
      </FormField>,
      {
        schema: z.object({ files: z.array(z.any()).min(1, 'Faylni tanlang') }),
        defaultValues: { files: [] },
      },
    );
    await submit();
    const field = await expectErrorAndFocus('Faylni tanlang');
    const picker = container.querySelector('input[type=file]:not([name])') as HTMLInputElement;
    const file = new File(['salom'], 'pasport.pdf', { type: 'application/pdf' });
    await user.upload(picker, file);
    await waitFor(() => expect(value('files')).toHaveLength(1));
    expect((value('files') as FileUploadItem[])[0]!.file).toBe(file);
    expect(field).toHaveTextContent('pasport.pdf');
    await waitFor(() => expect(field).not.toHaveAttribute('data-invalid'));
    act(() => form().reset());
    await waitFor(() => expect(field).not.toHaveTextContent('pasport.pdf'));
    expect(value('files')).toEqual([]);
  });
});
