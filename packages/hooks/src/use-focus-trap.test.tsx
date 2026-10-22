import { cleanup, fireEvent, render } from '@testing-library/react';
import { StrictMode, useRef, useState } from 'react';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it } from 'vitest';
import { useFocusTrap } from './use-focus-trap';

afterEach(cleanup);

interface DemoProps {
  active?: boolean;
  returnFocus?: boolean;
  withInitial?: boolean;
}

function Demo({ active = false, returnFocus, withInitial }: DemoProps) {
  const ref = useRef<HTMLDivElement>(null);
  const initialRef = useRef<HTMLInputElement>(null);
  useFocusTrap(ref, active, { returnFocus, initialFocus: withInitial ? initialRef : undefined });
  return (
    <>
      <button>Ochish</button>
      {active && (
        <div ref={ref}>
          <button>Birinchi</button>
          <input ref={initialRef} aria-label="Ism" />
          <button disabled>O‘chirilgan</button>
          <button>Oxirgi</button>
        </div>
      )}
      <button>Tashqari</button>
    </>
  );
}

function setup(props: Omit<DemoProps, 'active'> = {}) {
  const utils = render(<Demo {...props} />);
  utils.getByText('Ochish').focus();
  utils.rerender(<Demo {...props} active />);
  return { ...utils, close: () => utils.rerender(<Demo {...props} />) };
}

describe('useFocusTrap', () => {
  it('birinchi elementga fokus, Tab / Shift+Tab chetlarda aylanadi', () => {
    const { getByText } = setup();
    expect(document.activeElement).toBe(getByText('Birinchi'));

    getByText('Oxirgi').focus();
    fireEvent.keyDown(document.activeElement!, { key: 'Tab' });
    expect(document.activeElement).toBe(getByText('Birinchi'));

    fireEvent.keyDown(document.activeElement!, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(getByText('Oxirgi'));
  });

  it('tashqariga chiqqan fokus qaytariladi', () => {
    const { getByText } = setup();
    getByText('Tashqari').focus();
    expect(document.activeElement).toBe(getByText('Birinchi'));
  });

  it('initialFocus', () => {
    const { getByLabelText } = setup({ withInitial: true });
    expect(document.activeElement).toBe(getByLabelText('Ism'));
  });

  it('o‘chirilganda fokus avvalgi elementga qaytadi', () => {
    const { getByText, close } = setup();
    close();
    expect(document.activeElement).toBe(getByText('Ochish'));
  });

  it('returnFocus=false — qaytarmaydi', () => {
    const { getByText, close } = setup({ returnFocus: false });
    close();
    expect(document.activeElement).not.toBe(getByText('Ochish'));
  });

  it('unmount’da tinglovchilar olib tashlanadi', () => {
    const { unmount } = setup();
    unmount();
    const outside = document.createElement('button');
    document.body.append(outside);
    outside.focus();
    expect(document.activeElement).toBe(outside);
    outside.remove();
  });

  it('StrictMode: fokus qaytadi, eskirgan tuzoq qolmaydi', () => {
    const utils = render(<Demo />, { wrapper: StrictMode });
    utils.getByText('Ochish').focus();
    utils.rerender(<Demo active />);
    expect(document.activeElement).toBe(utils.getByText('Birinchi'));
    utils.getByText('Tashqari').focus();
    expect(document.activeElement).toBe(utils.getByText('Birinchi'));
    utils.rerender(<Demo />);
    expect(document.activeElement).toBe(utils.getByText('Ochish'));
    utils.getByText('Tashqari').focus();
    expect(document.activeElement).toBe(utils.getByText('Tashqari'));
  });

  it('ichma-ich: faqat ichkisi ishlaydi, yopilganda tashqisiga qaytadi', () => {
    function Nested({ inner }: { inner: boolean }) {
      const outerRef = useRef<HTMLDivElement>(null);
      const innerRef = useRef<HTMLDivElement>(null);
      useFocusTrap(outerRef, true);
      useFocusTrap(innerRef, inner);
      return (
        <div ref={outerRef}>
          <button>Tashqi</button>
          {inner && (
            <div ref={innerRef}>
              <button>Ichki</button>
            </div>
          )}
        </div>
      );
    }
    const { getByText, rerender } = render(<Nested inner={false} />, { wrapper: StrictMode });
    expect(document.activeElement).toBe(getByText('Tashqi'));
    rerender(<Nested inner />);
    expect(document.activeElement).toBe(getByText('Ichki'));
    getByText('Tashqi').focus();
    expect(document.activeElement).toBe(getByText('Ichki'));
    rerender(<Nested inner={false} />);
    expect(document.activeElement).toBe(getByText('Tashqi'));
  });

  it('keyin qo‘shilgan elementlar ham aylanishga kiradi', () => {
    function Dynamic() {
      const ref = useRef<HTMLDivElement>(null);
      const [more, setMore] = useState(false);
      useFocusTrap(ref, true);
      return (
        <div ref={ref}>
          <button onClick={() => setMore(true)}>Qo‘shish</button>
          {more && <button>Yangi</button>}
        </div>
      );
    }
    const { getByText } = render(<Dynamic />);
    fireEvent.click(getByText('Qo‘shish'));
    getByText('Yangi').focus();
    fireEvent.keyDown(document.activeElement!, { key: 'Tab' });
    expect(document.activeElement).toBe(getByText('Qo‘shish'));
  });

  it('SSR: renderToString xato bermaydi', () => {
    function Ssr() {
      const ref = useRef<HTMLDivElement>(null);
      useFocusTrap(ref, true);
      return <div ref={ref}>ok</div>;
    }
    expect(renderToString(<Ssr />)).toContain('ok');
  });
});
