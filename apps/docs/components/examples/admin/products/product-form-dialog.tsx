'use client';

import {
  Button,
  Dialog,
  Field,
  FileUpload,
  IconButton,
  Input,
  MoneyInput,
  Select,
  SelectItem,
  Switch,
  Textarea,
  Tooltip,
  toast,
  type FileUploadItem,
} from '@akhatmirzo/ui';
import { Trash2 } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { CATEGORIES, DEMO_NOW, type CategoryId, type Product } from '../data';
import { CATEGORY_ICON } from '../meta';
import { wait } from '../ui';
import { toThumbnail } from './image';

interface FormValues {
  name: string;
  category: CategoryId | '';
  price: number | null;
  stock: string;
  description: string;
  active: boolean;
  /** Mavjud rasm (data: URL) */
  image?: string;
  /** Yangi tanlangan fayl */
  file: File | null;
}

type Errors = Partial<Record<'name' | 'category' | 'price' | 'stock' | 'description', string>>;

const MAX_DESCRIPTION = 500;

function toValues(product: Product | null): FormValues {
  return {
    name: product?.name ?? '',
    category: product?.category ?? '',
    price: product?.price ?? null,
    stock: product ? String(product.stock) : '',
    description: product?.description ?? '',
    active: product?.active ?? true,
    image: product?.image,
    file: null,
  };
}

function validate(v: FormValues): Errors {
  const errors: Errors = {};
  if (v.name.trim().length < 3) errors.name = 'Nomini kiriting (kamida 3 ta belgi)';
  if (!v.category) errors.category = 'Toifani tanlang';
  if (!v.price || v.price < 1000) errors.price = "Narx kamida 1 000 so'm bo'lsin";
  if (v.stock.trim() === '') errors.stock = 'Ombordagi sonini kiriting';
  else if (!/^\d+$/.test(v.stock.trim())) errors.stock = "Butun musbat son bo'lsin";
  if (v.description.length > MAX_DESCRIPTION) errors.description = 'Tavsif juda uzun';
  return errors;
}

export interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** null — yangi mahsulot */
  product: Product | null;
  onSave: (product: Product) => void;
}

export function ProductFormDialog({ open, onOpenChange, product, onSave }: ProductFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open && (
        <Dialog.Content
          size="lg"
          title={product ? 'Mahsulotni tahrirlash' : "Yangi mahsulot qo'shish"}
          description={
            product
              ? `SKU: ${product.sku}`
              : "Mahsulot ma'lumotlarini to'ldiring — u darhol katalogda paydo bo'ladi."
          }
        >
          {/* key — boshqa mahsulot ochilganda forma qaytadan boshlanadi */}
          <ProductForm
            key={product?.id ?? 'new'}
            product={product}
            onCancel={() => onOpenChange(false)}
            onSave={onSave}
          />
        </Dialog.Content>
      )}
    </Dialog>
  );
}

function ProductForm({
  product,
  onCancel,
  onSave,
}: {
  product: Product | null;
  onCancel: () => void;
  onSave: (product: Product) => void;
}) {
  const [values, setValues] = useState(() => toValues(product));
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const errors = submitted ? validate(values) : {};

  const set = <K extends keyof FormValues>(key: K, value: FormValues[K]) =>
    setValues((prev) => ({ ...prev, [key]: value }));

  const onFiles = (items: FileUploadItem[]) => {
    // Ko'rinish (preview) FileUpload'ning o'zida — blob: URL bilan
    set('file', items[0]?.file ?? null);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    const found = validate(values);
    if (Object.keys(found).length) {
      // Birinchi xatoli maydonga fokus
      const first = Object.keys(found)[0];
      document.getElementById(`product-${first}`)?.focus();
      return;
    }
    setSaving(true);
    try {
      const image = values.file ? await toThumbnail(values.file) : values.image;
      await wait(500); // soxta server
      const category = values.category as CategoryId;
      const id = product?.id ?? `p${Date.now().toString(36)}`;
      onSave({
        id,
        sku:
          product?.sku ??
          `CM-${category.slice(0, 3).toUpperCase()}-${String(Date.now()).slice(-4)}`,
        name: values.name.trim(),
        category,
        price: values.price ?? 0,
        stock: Number(values.stock),
        description: values.description.trim(),
        active: values.active,
        image,
        sold: product?.sold ?? 0,
        popularity: product?.popularity ?? 1,
        createdAt: product?.createdAt ?? Math.max(Date.now(), DEMO_NOW.getTime()),
      });
    } catch {
      setSaving(false);
      toast.error("Rasmni o'qib bo'lmadi", { description: "Boshqa rasm tanlab ko'ring." });
    }
  };

  return (
    <form noValidate onSubmit={submit} className="flex flex-col gap-4">
      <Field label="Nomi" required error={errors.name}>
        <Input
          id="product-name"
          value={values.name}
          onChange={(e) => set('name', e.target.value)}
          placeholder="Masalan: Samsung Galaxy A55"
          autoComplete="off"
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Toifa" required error={errors.category}>
          <Select
            id="product-category"
            value={values.category}
            onValueChange={(v) => set('category', v as CategoryId)}
            placeholder="Toifani tanlang"
          >
            {CATEGORIES.map((c) => {
              const Icon = CATEGORY_ICON[c.id];
              return (
                <SelectItem key={c.id} value={c.id} icon={<Icon />}>
                  {c.label}
                </SelectItem>
              );
            })}
          </Select>
        </Field>
        <Field label="Narx" required error={errors.price}>
          <MoneyInput
            id="product-price"
            value={values.price}
            onValueChange={(v) => set('price', v)}
            placeholder="0"
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Ombordagi soni" required error={errors.stock} description="Dona hisobida">
          <Input
            id="product-stock"
            inputMode="numeric"
            value={values.stock}
            onChange={(e) => set('stock', e.target.value.replace(/[^\d]/g, ''))}
            placeholder="0"
            suffix="dona"
          />
        </Field>
        <div className="flex items-center rounded-lg border border-border px-4 py-3 sm:mt-7">
          <Switch
            checked={values.active}
            onCheckedChange={(v) => set('active', v)}
            label="Sotuvda"
            description="O'chirilsa, mahsulot saytda ko'rinmaydi"
          />
        </div>
      </div>

      <Field label="Tavsif" error={errors.description}>
        <Textarea
          id="product-description"
          value={values.description}
          onChange={(e) => set('description', e.target.value)}
          placeholder="Mahsulotning asosiy xususiyatlari..."
          autoResize
          minRows={3}
          maxRows={8}
          maxLength={MAX_DESCRIPTION}
          showCount
        />
      </Field>

      <Field label="Rasm" description="PNG yoki JPG, 5 MB gacha">
        {values.image && !values.file ? (
          <div className="flex items-center gap-3 rounded-lg border border-border p-3">
            <img src={values.image} alt="" className="size-16 rounded-lg object-cover" />
            <p className="flex-1 text-sm text-text-muted">Joriy rasm</p>
            <Tooltip content="Rasmni olib tashlash">
              <IconButton
                variant="ghost"
                aria-label="Rasmni olib tashlash"
                onClick={() => set('image', undefined)}
              >
                <Trash2 aria-hidden="true" />
              </IconButton>
            </Tooltip>
          </div>
        ) : (
          <FileUpload accept={['image/*']} maxSize={5 * 1024 * 1024} onFilesChange={onFiles} />
        )}
      </Field>

      <Dialog.Footer>
        <Button type="button" variant="ghost" onClick={onCancel} disabled={saving}>
          Bekor qilish
        </Button>
        <Button type="submit" variant="primary" loading={saving}>
          {product ? 'Saqlash' : "Qo'shish"}
        </Button>
      </Dialog.Footer>
    </form>
  );
}
