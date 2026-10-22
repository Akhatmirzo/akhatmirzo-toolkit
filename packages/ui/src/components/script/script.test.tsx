import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ScriptProvider, useScript } from './script-context';
import { ScriptToggle, Translit } from './script';

afterEach(() => window.localStorage.clear());

function Probe() {
  const { script, t } = useScript();
  return (
    <p data-testid="probe">
      {script}:{t('Salom dunyo')}
    </p>
  );
}

describe('Translit', () => {
  it('provider bo`lmasa — matn o`zgarmaydi, lang matndan aniqlanadi', () => {
    render(<Translit>Oʻzbekiston</Translit>);
    const el = screen.getByText('Oʻzbekiston');
    expect(el.tagName).toBe('SPAN');
    expect(el).toHaveAttribute('lang', 'uz-Latn');
  });

  it('kirill provider — matn o`giriladi, lang="uz-Cyrl", as', () => {
    render(
      <ScriptProvider defaultScript="cyrillic">
        <Translit as="h1">Oʻzbekiston boʻylab yetkazib berish</Translit>
      </ScriptProvider>,
    );
    const el = screen.getByRole('heading');
    expect(el).toHaveTextContent('Ўзбекистон бўйлаб етказиб бериш');
    expect(el).toHaveAttribute('lang', 'uz-Cyrl');
  });

  it('lotin provider — kirill matn lotinga, lang="uz-Latn"', () => {
    render(
      <ScriptProvider>
        <Translit>Салом, дунё</Translit>
      </ScriptProvider>,
    );
    expect(screen.getByText('Salom, dunyo')).toHaveAttribute('lang', 'uz-Latn');
  });
});

describe('useScript', () => {
  it('provider tashqarisida — latin, t o`zgartirmaydi', () => {
    render(<Probe />);
    expect(screen.getByTestId('probe')).toHaveTextContent('latin:Salom dunyo');
  });

  it('setScript va t', async () => {
    function Switcher() {
      const { setScript } = useScript();
      return <button onClick={() => setScript('cyrillic')}>kirill</button>;
    }
    const user = userEvent.setup();
    render(
      <ScriptProvider>
        <Switcher />
        <Probe />
      </ScriptProvider>,
    );
    await user.click(screen.getByRole('button'));
    expect(screen.getByTestId('probe')).toHaveTextContent('cyrillic:Салом дунё');
  });
});

describe('ScriptProvider', () => {
  it('SSR: renderToString defaultScript bilan, localStorage o`qilmaydi', () => {
    window.localStorage.setItem('script', 'cyrillic');
    const html = renderToString(
      <ScriptProvider defaultScript="latin" storageKey="script">
        <Translit>Salom</Translit>
      </ScriptProvider>,
    );
    expect(html).toContain('Salom');
    expect(html).toContain('lang="uz-Latn"');
  });

  it('gidratatsiyadan keyin saqlangan tanlov o`qiladi', () => {
    window.localStorage.setItem('script', 'cyrillic');
    const onScriptChange = vi.fn();
    render(
      <ScriptProvider storageKey="script" onScriptChange={onScriptChange}>
        <Probe />
      </ScriptProvider>,
    );
    expect(screen.getByTestId('probe')).toHaveTextContent('cyrillic:Салом дунё');
    expect(onScriptChange).toHaveBeenCalledWith('cyrillic');
  });

  it('noto`g`ri saqlangan qiymat e`tiborsiz', () => {
    window.localStorage.setItem('script', 'arabic');
    render(
      <ScriptProvider storageKey="script">
        <Probe />
      </ScriptProvider>,
    );
    expect(screen.getByTestId('probe')).toHaveTextContent('latin:');
  });

  it('tanlov localStorage ga yoziladi', async () => {
    const user = userEvent.setup();
    render(
      <ScriptProvider storageKey="ak-script">
        <ScriptToggle />
      </ScriptProvider>,
    );
    await user.click(screen.getByRole('radio', { name: 'Кирилл' }));
    expect(window.localStorage.getItem('ak-script')).toBe('cyrillic');
  });

  it('localStorage xato bersa ham ishlaydi', async () => {
    const get = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('denied');
    });
    const set = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('denied');
    });
    const user = userEvent.setup();
    render(
      <ScriptProvider storageKey="script">
        <ScriptToggle />
        <Probe />
      </ScriptProvider>,
    );
    await user.click(screen.getByRole('radio', { name: 'Кирилл' }));
    expect(screen.getByTestId('probe')).toHaveTextContent('cyrillic:');
    get.mockRestore();
    set.mockRestore();
  });

  it('boshqa tabdagi o`zgarish (storage hodisasi)', () => {
    render(
      <ScriptProvider storageKey="script">
        <Probe />
      </ScriptProvider>,
    );
    act(() => {
      window.dispatchEvent(new StorageEvent('storage', { key: 'script', newValue: 'cyrillic' }));
    });
    expect(screen.getByTestId('probe')).toHaveTextContent('cyrillic:');
  });

  it('boshqariladigan rejim', async () => {
    const onScriptChange = vi.fn();
    const user = userEvent.setup();
    render(
      <ScriptProvider script="latin" onScriptChange={onScriptChange}>
        <ScriptToggle />
        <Probe />
      </ScriptProvider>,
    );
    await user.click(screen.getByRole('radio', { name: 'Кирилл' }));
    expect(onScriptChange).toHaveBeenCalledWith('cyrillic');
    // ota qiymatni o'zgartirmadi — lotin qoladi
    expect(screen.getByTestId('probe')).toHaveTextContent('latin:');
  });
});

describe('ScriptToggle', () => {
  it('standart matnlar, guruh nomi va almashtirish', async () => {
    const user = userEvent.setup();
    render(
      <ScriptProvider>
        <ScriptToggle />
        <Translit>Salom</Translit>
      </ScriptProvider>,
    );
    expect(screen.getByRole('radiogroup', { name: 'Alifbo' })).toBeInTheDocument();
    const latin = screen.getByRole('radio', { name: 'Lotin' });
    const cyr = screen.getByRole('radio', { name: 'Кирилл' });
    expect(latin).toBeChecked();
    expect(cyr).toHaveAttribute('lang', 'uz-Cyrl');
    await user.click(cyr);
    expect(cyr).toBeChecked();
    expect(screen.getByText('Салом')).toBeInTheDocument();
  });

  it('labels va provider siz onValueChange', async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    render(
      <ScriptToggle
        size="sm"
        onValueChange={onValueChange}
        labels={{ latin: 'Lat', cyrillic: 'Кир', group: 'Yozuv' }}
      />,
    );
    expect(screen.getByRole('radiogroup', { name: 'Yozuv' })).toHaveAttribute('data-size', 'sm');
    await user.click(screen.getByRole('radio', { name: 'Кир' }));
    expect(onValueChange).toHaveBeenCalledWith('cyrillic');
    expect(screen.getByRole('radio', { name: 'Кир' })).toBeChecked();
  });
});
