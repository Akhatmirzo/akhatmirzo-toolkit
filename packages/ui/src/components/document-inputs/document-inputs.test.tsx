import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Field } from '../field';
import {
  BankAccountInput,
  CarPlateInput,
  InnInput,
  PassportInput,
  PinflInput,
  getCarPlateDetails,
} from './document-inputs';
import { carPlateSpec } from './specs';

const box = () => screen.getByRole('textbox') as HTMLInputElement;

describe('PinflInput', () => {
  it('yozish: 5-5-4 ko`rinish, qiymat toza, onDetails to`liq kiritilganda', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const onDetails = vi.fn();
    render(<PinflInput aria-label="JShShIR" onValueChange={onValueChange} onDetails={onDetails} />);
    await user.type(box(), '3150390123456');
    expect(onDetails).not.toHaveBeenCalled();
    await user.type(box(), '7');
    expect(box()).toHaveValue('31503 90123 4567');
    expect(onValueChange).toHaveBeenLastCalledWith('31503901234567', expect.anything());
    expect(onDetails).toHaveBeenCalledTimes(1);
    expect(onDetails).toHaveBeenCalledWith({
      complete: true,
      valid: true,
      gender: 'male',
      birthDate: new Date(1990, 2, 15),
    });
    expect(box()).not.toHaveAttribute('aria-invalid');
    expect(box()).toHaveAttribute('inputmode', 'numeric');
  });

  it('harflar va ortiqcha raqamlar qabul qilinmaydi', async () => {
    const user = userEvent.setup();
    render(<PinflInput aria-label="JShShIR" />);
    await user.type(box(), '31a50390123456789');
    expect(box()).toHaveValue('31503 90123 4567');
  });

  it('noto`g`ri sana — invalid, gender null', async () => {
    const user = userEvent.setup();
    const onDetails = vi.fn();
    render(<PinflInput aria-label="JShShIR" onDetails={onDetails} />);
    await user.type(box(), '33102901234567');
    expect(box()).toHaveAttribute('aria-invalid', 'true');
    expect(onDetails).toHaveBeenCalledWith({
      complete: true,
      valid: false,
      gender: null,
      birthDate: null,
    });
  });

  it('checksum va validate={false}', () => {
    const { rerender } = render(
      <PinflInput aria-label="JShShIR" checksum defaultValue="31503901234567" />,
    );
    expect(box()).toHaveAttribute('aria-invalid', 'true');
    rerender(<PinflInput aria-label="JShShIR" checksum value="31503901234562" />);
    expect(box()).not.toHaveAttribute('aria-invalid');
    rerender(<PinflInput aria-label="JShShIR" checksum validate={false} value="31503901234567" />);
    expect(box()).not.toHaveAttribute('aria-invalid');
  });

  it('Field bilan va name — yashirin toza qiymat', () => {
    const { container } = render(
      <Field label="JShShIR" error="Majburiy">
        <PinflInput name="pinfl" defaultValue="315 039 012 345 67" />
      </Field>,
    );
    expect(screen.getByLabelText('JShShIR')).toHaveValue('31503 90123 4567');
    expect(box()).toHaveAttribute('aria-invalid', 'true');
    expect(container.querySelector('input[type="hidden"]')).toHaveValue('31503901234567');
  });
});

describe('PassportInput', () => {
  it('kichik harf katta bo`ladi, kirill va ortiqcha belgilar tashlanadi', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<PassportInput aria-label="Pasport" onValueChange={onValueChange} />);
    await user.type(box(), 'аa b1234567 89');
    expect(box()).toHaveValue('AB 1234567');
    expect(onValueChange).toHaveBeenLastCalledWith('AB1234567', { complete: true, valid: true });
    expect(box()).toHaveAttribute('autocapitalize', 'characters');
  });

  it('boshqariladigan qiymat normallashtiriladi', () => {
    render(<PassportInput aria-label="Pasport" value="ad 123-45-67" />);
    expect(box()).toHaveValue('AD 1234567');
  });
});

describe('InnInput', () => {
  it('3-3-3 va toza qiymat', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<InnInput aria-label="STIR" onValueChange={onValueChange} />);
    await user.type(box(), '123456789');
    expect(box()).toHaveValue('123 456 789');
    expect(onValueChange).toHaveBeenLastCalledWith('123456789', { complete: true, valid: true });
    expect(box()).not.toHaveAttribute('aria-invalid');
  });

  it('0 bilan boshlansa — darhol invalid', async () => {
    const user = userEvent.setup();
    render(<InnInput aria-label="STIR" />);
    await user.type(box(), '0');
    expect(box()).toHaveAttribute('aria-invalid', 'true');
  });
});

describe('BankAccountInput', () => {
  it('4 tadan guruh, 20 raqam', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<BankAccountInput aria-label="Hisob" onValueChange={onValueChange} />);
    await user.type(box(), '2020800090001234500199');
    expect(box()).toHaveValue('2020 8000 9000 1234 5001');
    expect(onValueChange).toHaveBeenLastCalledWith('20208000900012345001', {
      complete: true,
      valid: true,
    });
  });
});

describe('CarPlateInput', () => {
  it('spec: jismoniy va yuridik format 3-belgidan', () => {
    expect(carPlateSpec.conform('01a123bc', '')).toBe('01A123BC');
    expect(carPlateSpec.format('01A123BC').text).toBe('01  A 123 BC');
    expect(carPlateSpec.conform('01123abc', '')).toBe('01123ABC');
    expect(carPlateSpec.format('01123ABC').text).toBe('01  123 ABC');
    // jismoniy: 4-o'ringa harf yozib bo'lmaydi; kirill harf qabul qilinmaydi
    expect(carPlateSpec.conform('01AB', '')).toBe('01A');
    expect(carPlateSpec.conform('01А', '')).toBe('01');
  });

  it('jismoniy: ko`rinish, toza qiymat, onDetails({ region, type })', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const onDetails = vi.fn();
    render(
      <CarPlateInput aria-label="Raqam" onValueChange={onValueChange} onDetails={onDetails} />,
    );
    await user.type(box(), '01a123bc');
    expect(box()).toHaveValue('01  A 123 BC');
    expect(onValueChange).toHaveBeenLastCalledWith('01A123BC', expect.anything());
    const last = onDetails.mock.lastCall![0];
    expect(last.type).toBe('personal');
    expect(last.region.id).toBe('tashkent-city');
    expect(last.valid).toBe(true);
    expect(box()).toHaveAttribute('data-plate-type', 'personal');
    expect(box()).not.toHaveAttribute('aria-invalid');
  });

  it('yuridik format va hudud yozish paytida aniqlanadi', async () => {
    const user = userEvent.setup();
    const onDetails = vi.fn();
    render(<CarPlateInput aria-label="Raqam" onDetails={onDetails} />);
    await user.type(box(), '30');
    expect(onDetails.mock.lastCall![0]).toMatchObject({ type: null, complete: false });
    expect(onDetails.mock.lastCall![0].region.id).toBe('samarkand');
    await user.type(box(), '123abc');
    expect(box()).toHaveValue('30  123 ABC');
    expect(onDetails.mock.lastCall![0]).toMatchObject({ type: 'legal', valid: true });
  });

  it('noma`lum hudud kodi — darhol invalid', async () => {
    const user = userEvent.setup();
    render(<CarPlateInput aria-label="Raqam" />);
    await user.type(box(), '00');
    expect(box()).toHaveAttribute('aria-invalid', 'true');
  });

  it('getCarPlateDetails', () => {
    expect(getCarPlateDetails('')).toEqual({
      complete: false,
      valid: false,
      region: null,
      type: null,
    });
    expect(getCarPlateDetails('95A')).toMatchObject({ type: 'personal', valid: false });
  });
});
