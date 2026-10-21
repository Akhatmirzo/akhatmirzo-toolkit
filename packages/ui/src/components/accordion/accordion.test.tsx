import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  type AccordionProps,
} from './index';

const faq = [
  { value: 'q1', title: 'Yetkazib berish qancha vaqt oladi?', body: '2–3 ish kuni.' },
  { value: 'q2', title: 'Qanday to‘lov usullari bor?', body: 'Click, Payme va naqd pul.' },
  { value: 'q3', title: 'Mahsulotni qaytarsa bo‘ladimi?', body: 'Ha, 14 kun ichida.' },
];

function Faq(props: Partial<AccordionProps>) {
  return (
    <Accordion {...(props as AccordionProps)}>
      {faq.map((q) => (
        <Accordion.Item key={q.value} value={q.value} title={q.title}>
          {q.body}
        </Accordion.Item>
      ))}
    </Accordion>
  );
}

const trigger = (name: string | RegExp) => screen.getByRole('button', { name });

describe('Accordion', () => {
  it('sarlavhalar h3 ichidagi tugma; aria-expanded va aria-controls ulangan', () => {
    render(<Faq defaultValue="q1" />);
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(3);
    const first = trigger(/Yetkazib berish/);
    expect(first).toHaveAttribute('aria-expanded', 'true');
    const region = screen.getByRole('region', { name: /Yetkazib berish/ });
    expect(region).toHaveTextContent('2–3 ish kuni.');
    expect(first).toHaveAttribute('aria-controls', region.id);
    expect(trigger(/to‘lov/)).toHaveAttribute('aria-expanded', 'false');
  });

  it('single: bittasi ochilsa boshqasi yopiladi; collapsible default true', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Faq defaultValue="q1" onValueChange={onValueChange} />);
    await user.click(trigger(/to‘lov/));
    expect(onValueChange).toHaveBeenLastCalledWith('q2');
    expect(trigger(/to‘lov/)).toHaveAttribute('aria-expanded', 'true');
    expect(trigger(/Yetkazib/)).toHaveAttribute('aria-expanded', 'false');

    await user.click(trigger(/to‘lov/));
    expect(onValueChange).toHaveBeenLastCalledWith('');
    expect(trigger(/to‘lov/)).toHaveAttribute('aria-expanded', 'false');
  });

  it('collapsible={false}: ochiq bo‘limni yopib bo‘lmaydi', async () => {
    const user = userEvent.setup();
    render(<Faq defaultValue="q1" collapsible={false} />);
    await user.click(trigger(/Yetkazib/));
    expect(trigger(/Yetkazib/)).toHaveAttribute('aria-expanded', 'true');
    expect(trigger(/Yetkazib/)).toHaveAttribute('aria-disabled', 'true');
  });

  it('multiple: bir nechtasi birga ochiq turadi', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Faq type="multiple" defaultValue={['q1']} onValueChange={onValueChange} />);
    await user.click(trigger(/to‘lov/));
    expect(onValueChange).toHaveBeenLastCalledWith(['q1', 'q2']);
    expect(trigger(/Yetkazib/)).toHaveAttribute('aria-expanded', 'true');
    expect(trigger(/to‘lov/)).toHaveAttribute('aria-expanded', 'true');
  });

  it('klaviatura: ↑ ↓ sarlavhalar bo‘ylab, Home / End, Enter / Space ochadi', async () => {
    const user = userEvent.setup();
    render(<Faq />);
    await user.tab();
    expect(trigger(/Yetkazib/)).toHaveFocus();
    await user.keyboard('{ArrowDown}');
    expect(trigger(/to‘lov/)).toHaveFocus();
    await user.keyboard('{End}');
    expect(trigger(/qaytarsa/)).toHaveFocus();
    await user.keyboard('{ArrowDown}');
    expect(trigger(/Yetkazib/)).toHaveFocus();
    await user.keyboard('{End}{Home}');
    expect(trigger(/Yetkazib/)).toHaveFocus();

    await user.keyboard('{Enter}');
    expect(trigger(/Yetkazib/)).toHaveAttribute('aria-expanded', 'true');
    await user.keyboard(' ');
    expect(trigger(/Yetkazib/)).toHaveAttribute('aria-expanded', 'false');
  });

  it('boshqariladigan rejim', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { rerender } = render(<Faq value="q1" onValueChange={onValueChange} />);
    await user.click(trigger(/qaytarsa/));
    expect(onValueChange).toHaveBeenCalledWith('q3');
    expect(trigger(/Yetkazib/)).toHaveAttribute('aria-expanded', 'true');
    rerender(<Faq value="q3" onValueChange={onValueChange} />);
    expect(trigger(/qaytarsa/)).toHaveAttribute('aria-expanded', 'true');
    expect(trigger(/Yetkazib/)).toHaveAttribute('aria-expanded', 'false');
  });

  it('Item / Trigger / Content kompozitsiyasi va disabled', async () => {
    const user = userEvent.setup();
    const contentRef = createRef<HTMLDivElement>();
    render(
      <Accordion variant="bordered" data-testid="root" className="max-w-md">
        <AccordionItem value="a">
          <AccordionTrigger>Sozlamalar</AccordionTrigger>
          <AccordionContent ref={contentRef} className="custom">
            Ichki kontent
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="b" disabled>
          <AccordionTrigger>O‘chirilgan</AccordionTrigger>
          <AccordionContent>Yashirin</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );
    const root = screen.getByTestId('root');
    expect(root).toHaveAttribute('data-variant', 'bordered');
    expect(root).toHaveClass('max-w-md', 'border');

    await user.click(trigger('Sozlamalar'));
    expect(contentRef.current).toHaveTextContent('Ichki kontent');
    expect(contentRef.current).toHaveClass('custom');
    expect(contentRef.current).toHaveAttribute('data-state', 'open');

    const disabled = trigger('O‘chirilgan');
    expect(disabled).toBeDisabled();
    await user.click(disabled);
    expect(disabled).toHaveAttribute('aria-expanded', 'false');
  });

  it('chevron ochilganda buriladi (group-data-[state=open])', () => {
    render(<Faq defaultValue="q1" variant="ghost" />);
    const button = trigger(/Yetkazib/);
    expect(button).toHaveAttribute('data-state', 'open');
    const chevron = button.querySelector('[data-accordion-chevron]');
    expect(chevron).toHaveAttribute('aria-hidden', 'true');
    expect(chevron).toHaveClass('group-data-[state=open]:rotate-180');
  });
});
