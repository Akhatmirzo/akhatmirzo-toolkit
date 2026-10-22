import { UZ_REGIONS } from '@akhatmirzo/core';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ScriptProvider } from '../script';
import { RegionSelect } from './region-select';

describe('RegionSelect', () => {
  it('14 ta hudud, tanlash — id va region', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<RegionSelect aria-label="Hudud" onValueChange={onValueChange} />);
    const trigger = screen.getByRole('combobox');
    expect(trigger).toHaveTextContent('Hududni tanlang');
    await user.click(trigger);
    expect(screen.getAllByRole('option')).toHaveLength(14);
    await user.click(screen.getByRole('option', { name: 'Samarqand viloyati' }));
    expect(onValueChange).toHaveBeenCalledWith(
      'samarkand',
      UZ_REGIONS.find((r) => r.id === 'samarkand'),
    );
    expect(trigger).toHaveTextContent('Samarqand viloyati');
  });

  it('includeCity={false} — Toshkent shahri yo`q', async () => {
    const user = userEvent.setup();
    render(<RegionSelect aria-label="Hudud" includeCity={false} />);
    await user.click(screen.getByRole('combobox'));
    expect(screen.getAllByRole('option')).toHaveLength(13);
    expect(screen.queryByRole('option', { name: 'Toshkent shahri' })).not.toBeInTheDocument();
  });

  it('boshqariladigan value va script prop', () => {
    render(<RegionSelect aria-label="Hudud" value="fergana" script="cyrillic" />);
    expect(screen.getByRole('combobox')).toHaveTextContent('Фарғона вилояти');
  });

  it('ScriptProvider dagi alifbo, placeholder ham', () => {
    render(
      <ScriptProvider defaultScript="cyrillic">
        <RegionSelect aria-label="Hudud" />
      </ScriptProvider>,
    );
    expect(screen.getByRole('combobox')).toHaveTextContent('Ҳудудни танланг');
  });
});
