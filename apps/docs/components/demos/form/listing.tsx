'use client';

import { zUz } from '@akhatmirzo/core/zod';
import { FileUpload, MoneyInput, SegmentedControl, TagInput, toast } from '@akhatmirzo/ui';
import { Form, FormField, FormSubmit } from '@akhatmirzo/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const schema = z.object({
  condition: z.enum(['new', 'used'], { error: 'Holatini tanlang' }),
  price: zUz.money({ min: 10_000, max: 500_000_000 }),
  tags: z.array(z.string()).min(1, 'Kamida bitta teg').max(5, "Ko'pi bilan 5 ta teg"),
  photos: z.array(z.unknown()).min(1, 'Kamida bitta rasm yuklang'),
});

export default function FormListing() {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { price: null, tags: [], photos: [] },
  });

  return (
    <Form
      form={form}
      onSubmit={(data) => {
        toast.success("E'lon saqlandi", {
          description: `${data.price} so'm · ${data.tags.join(', ')}`,
        });
        form.reset();
      }}
      className="flex w-full max-w-md flex-col gap-4"
    >
      <FormField name="condition" label="Holati">
        <SegmentedControl fullWidth>
          <SegmentedControl.Item value="new">Yangi</SegmentedControl.Item>
          <SegmentedControl.Item value="used">Ishlatilgan</SegmentedControl.Item>
        </SegmentedControl>
      </FormField>
      <FormField name="price" label="Narxi" description="10 000 so'mdan 500 mln so'mgacha">
        <MoneyInput showWords />
      </FormField>
      <FormField name="tags" label="Teglar" description="Enter yoki vergul bilan qo'shing">
        <TagInput placeholder="telefon, samsung" />
      </FormField>
      <FormField name="photos" label="Rasmlar">
        <FileUpload accept={['image/*']} multiple maxFiles={4} />
      </FormField>
      <FormSubmit>E'lonni joylash</FormSubmit>
    </Form>
  );
}
