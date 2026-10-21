import { act, createEvent, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StrictMode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Field } from '../field';
import { FileUpload, matchesAccept, type FileUploadContext } from './file-upload';

const MB = 1024 * 1024;

function makeFile(name: string, type: string, size = 1024) {
  const file = new File(['x'], name, { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
}

const picker = (container: HTMLElement) =>
  container.querySelector('input[type=file]:not([name])') as HTMLInputElement;

/** Qo'lda boshqariladigan soxta yuklash */
function deferredUpload() {
  const calls: {
    file: File;
    ctx: FileUploadContext;
    resolve: (v: unknown) => void;
    reject: (e: unknown) => void;
  }[] = [];
  const upload = vi.fn(
    (file: File, ctx: FileUploadContext) =>
      new Promise((resolve, reject) => {
        calls.push({ file, ctx, resolve, reject });
      }),
  );
  return { upload, calls };
}

describe('matchesAccept', () => {
  it('MIME, wildcard va kengaytma', () => {
    const accept = ['image/*', '.pdf'];
    expect(matchesAccept({ name: 'a.PNG', type: 'image/png' }, accept)).toBe(true);
    expect(matchesAccept({ name: 'hisobot.pdf', type: '' }, accept)).toBe(true);
    expect(matchesAccept({ name: 'a.zip', type: 'application/zip' }, accept)).toBe(false);
    // sudrash paytida nom yo'q
    expect(matchesAccept({ type: 'application/pdf' }, accept)).toBe(true);
    expect(matchesAccept({ type: 'text/plain' }, accept)).toBe(false);
    expect(matchesAccept({ type: 'text/plain' }, undefined)).toBe(true);
  });
});

describe('FileUpload', () => {
  it('render: dropzone, cheklovlar matni, klaviatura bilan ochiladi', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <FileUpload accept={['image/*', '.pdf']} maxSize={5 * MB} maxFiles={5} multiple />,
    );
    const dz = screen.getByRole('button', { name: 'Faylni shu yerga tashlang yoki tanlang' });
    expect(dz).toHaveAccessibleDescription("Rasmlar, PDF · 5 MB gacha · ko'pi bilan 5 ta");
    expect(dz).toHaveAttribute('tabindex', '0');
    const input = picker(container);
    expect(input).toHaveAttribute('accept', 'image/*,.pdf');
    expect(input).toHaveAttribute('multiple');
    const click = vi.spyOn(input, 'click');
    dz.focus();
    await user.keyboard('{Enter}');
    await user.keyboard(' ');
    expect(click).toHaveBeenCalledTimes(2);
  });

  it('tanlash: ro`yxat, progress, foiz, tayyor ✓', async () => {
    const { upload, calls } = deferredUpload();
    const onFilesChange = vi.fn();
    const { container } = render(
      <FileUpload multiple upload={upload} onFilesChange={onFilesChange} />,
    );
    const file = makeFile(
      'hisobot-oktabr-2026-yakuniy-variant-tasdiqlangan.pdf',
      'application/pdf',
      2 * MB,
    );
    await userEvent.upload(picker(container), file);

    const list = screen.getByRole('list', { name: 'Tanlangan fayllar' });
    const row = within(list).getByRole('listitem');
    expect(row).toHaveAttribute('data-status', 'uploading');
    expect(within(row).getByTitle(file.name).textContent).toContain('…');
    expect(row).toHaveTextContent('2 MB');
    expect(upload).toHaveBeenCalledWith(
      file,
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );

    act(() => calls[0]!.ctx.onProgress(42.4));
    expect(within(row).getByRole('progressbar')).toHaveAttribute('aria-valuenow', '42');
    expect(row).toHaveTextContent('42%');

    await act(async () => calls[0]!.resolve({ url: '/f/1' }));
    expect(row).toHaveAttribute('data-status', 'done');
    expect(row).toHaveTextContent('Yuklandi');
    expect(within(row).queryByRole('progressbar')).not.toBeInTheDocument();
    expect(onFilesChange).toHaveBeenLastCalledWith([
      expect.objectContaining({ status: 'done', progress: 100, result: { url: '/f/1' } }),
    ]);
    expect(
      within(row).getByRole('button', { name: `O'chirish: ${file.name}` }),
    ).toBeInTheDocument();
  });

  it('bekor qilish: AbortController signal abort bo`ladi, qator o`chadi', async () => {
    const user = userEvent.setup();
    const { upload, calls } = deferredUpload();
    const { container } = render(<FileUpload upload={upload} />);
    await user.upload(picker(container), makeFile('rasm.png', 'image/png'));
    await user.click(screen.getByRole('button', { name: 'Bekor qilish: rasm.png' }));
    expect(calls[0]!.ctx.signal.aborted).toBe(true);
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('xato va "Qayta urinish"', async () => {
    const user = userEvent.setup();
    const { upload, calls } = deferredUpload();
    const { container } = render(<FileUpload upload={upload} />);
    await user.upload(picker(container), makeFile('shartnoma.pdf', 'application/pdf'));
    await act(async () => calls[0]!.reject(new Error('500')));
    const row = screen.getByRole('listitem');
    expect(row).toHaveAttribute('data-status', 'error');
    expect(row).toHaveTextContent('Tarmoq xatosi');
    await user.click(within(row).getByRole('button', { name: 'Qayta urinish' }));
    expect(upload).toHaveBeenCalledTimes(2);
    expect(row).toHaveAttribute('data-status', 'uploading');
    await act(async () => calls[1]!.resolve(null));
    expect(row).toHaveAttribute('data-status', 'done');
  });

  it('getErrorMessage — o`z xato matni', async () => {
    const upload = vi.fn(() => Promise.reject(new Error('Server band')));
    const { container } = render(
      <FileUpload upload={upload} getErrorMessage={(e) => (e as Error).message} />,
    );
    await userEvent.upload(picker(container), makeFile('a.pdf', 'application/pdf'));
    expect(await screen.findByText('· Server band')).toBeInTheDocument();
  });

  it('noto`g`ri tur va katta hajm — xato qatori, qayta urinishsiz; maxFiles', async () => {
    const user = userEvent.setup({ applyAccept: false });
    const upload = vi.fn(() => new Promise(() => {}));
    const { container } = render(
      <FileUpload
        accept={['image/*', '.pdf']}
        maxSize={5 * MB}
        maxFiles={2}
        multiple
        upload={upload}
      />,
    );
    await user.upload(picker(container), [
      makeFile('arxiv.zip', 'application/zip'),
      makeFile('video.png', 'image/png', 8 * MB),
      makeFile('a.png', 'image/png'),
      makeFile('b.png', 'image/png'),
      makeFile('c.png', 'image/png'),
    ]);
    const rows = screen.getAllByRole('listitem');
    expect(rows).toHaveLength(4);
    expect(rows[0]).toHaveTextContent('Bu turdagi fayl qabul qilinmaydi');
    expect(rows[1]).toHaveTextContent('Hajmi 5 MB dan katta');
    expect(within(rows[0]!).queryByRole('button', { name: 'Qayta urinish' })).toBeNull();
    expect(screen.getByText("Ko'pi bilan 2 ta fayl yuklash mumkin")).toBeInTheDocument();
    expect(upload).toHaveBeenCalledTimes(2);
  });

  it('multiple bo`lmasa — yangi fayl eskisini almashtiradi', async () => {
    const { container } = render(<FileUpload />);
    await userEvent.upload(picker(container), makeFile('bir.pdf', 'application/pdf'));
    await userEvent.upload(picker(container), makeFile('ikki.pdf', 'application/pdf'));
    const rows = screen.getAllByRole('listitem');
    expect(rows).toHaveLength(1);
    expect(rows[0]).toHaveTextContent('ikki.pdf');
    expect(rows[0]).toHaveAttribute('data-status', 'idle');
  });

  it('drag-over (primary) va noto`g`ri fayl (danger) holatlari, tashlash', () => {
    const onFilesChange = vi.fn();
    render(<FileUpload accept={['image/*']} onFilesChange={onFilesChange} />);
    const dz = screen.getByRole('button');
    const dt = (type: string) => ({
      items: [{ kind: 'file', type }],
      files: [makeFile('r.png', type)],
      dropEffect: 'none',
    });
    fireEvent.dragEnter(dz, { dataTransfer: dt('image/png') });
    expect(dz).toHaveAttribute('data-drag', 'over');
    expect(dz).toHaveTextContent("Faylni qo'yib yuboring");
    fireEvent.dragLeave(dz, { dataTransfer: dt('image/png') });
    expect(dz).toHaveAttribute('data-drag', 'idle');
    fireEvent.dragEnter(dz, { dataTransfer: dt('application/zip') });
    expect(dz).toHaveAttribute('data-drag', 'reject');
    expect(dz).toHaveTextContent('Bu turdagi fayl qabul qilinmaydi');
    fireEvent.drop(dz, { dataTransfer: dt('image/png') });
    expect(dz).toHaveAttribute('data-drag', 'idle');
    expect(screen.getByRole('listitem')).toHaveTextContent('r.png');
    expect(onFilesChange).toHaveBeenCalledTimes(1);
  });

  it('Ctrl+V: fokusdagi dropzone`ga joylash', () => {
    render(<FileUpload accept={['image/*']} />);
    const dz = screen.getByRole('button');
    const event = createEvent.paste(dz, {
      clipboardData: { files: [makeFile('skrinshot.png', 'image/png')] },
    });
    fireEvent(dz, event);
    expect(screen.getByRole('listitem')).toHaveTextContent('skrinshot.png');
    expect(event.defaultPrevented).toBe(true);
  });

  it('paste="global": sahifaning istalgan joyida, input ichida emas', () => {
    render(
      <>
        <input aria-label="matn" />
        <FileUpload paste="global" />
      </>,
    );
    const paste = (target: Element) => {
      const e = createEvent.paste(target, {
        clipboardData: { files: [makeFile('s.png', 'image/png')] },
      });
      fireEvent(target, e);
    };
    paste(screen.getByLabelText('matn'));
    expect(screen.queryByRole('listitem')).toBeNull();
    paste(document.body);
    expect(screen.getByRole('listitem')).toHaveTextContent('s.png');
  });

  it('button varianti va disabled', async () => {
    const { container, rerender } = render(<FileUpload variant="button" maxSize={MB} />);
    const btn = screen.getByRole('button', { name: 'Fayl tanlash' });
    expect(btn).toHaveAccessibleDescription('1 MB gacha');
    rerender(<FileUpload variant="button" disabled />);
    expect(picker(container)).toBeDisabled();
    rerender(<FileUpload disabled />);
    expect(screen.getByRole('button')).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByRole('button')).toHaveAttribute('tabindex', '-1');
  });

  it('Field bilan: label, xato, aria', () => {
    render(
      <Field label="Hujjatlar" error="Kamida bitta fayl kerak">
        <FileUpload />
      </Field>,
    );
    const dz = screen.getByRole('button', {
      name: 'Hujjatlar Faylni shu yerga tashlang yoki tanlang',
    });
    expect(dz).toHaveAttribute('aria-invalid', 'true');
    expect(dz).toHaveAccessibleDescription('Kamida bitta fayl kerak');
    expect(screen.getByLabelText('Hujjatlar', { selector: 'input' })).toHaveAttribute(
      'type',
      'file',
    );
  });

  it('labels bilan matnlar o`zgaradi', () => {
    render(<FileUpload labels={{ prompt: 'Drop files or', browse: 'browse' }} />);
    expect(screen.getByRole('button', { name: 'Drop files or browse' })).toBeInTheDocument();
  });

  it('StrictMode: o`zgarishsiz onFilesChange chaqirilmaydi', async () => {
    const onFilesChange = vi.fn();
    const { container } = render(
      <StrictMode>
        <FileUpload onFilesChange={onFilesChange} />
      </StrictMode>,
    );
    expect(onFilesChange).not.toHaveBeenCalled();
    await userEvent.upload(picker(container), makeFile('a.txt', 'text/plain'));
    expect(onFilesChange).toHaveBeenCalledTimes(1);
    expect(onFilesChange.mock.calls[0]?.[0]).toHaveLength(1);
  });
});
