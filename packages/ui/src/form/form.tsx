import type { ComponentProps, ReactNode } from 'react';
import {
  FormProvider,
  useFormState,
  type FieldValues,
  type SubmitErrorHandler,
  type SubmitHandler,
  type UseFormReturn,
} from 'react-hook-form';
import { Alert, type AlertProps } from '../components/alert';
import { Button, type ButtonProps } from '../components/button';

export interface FormProps<
  TFieldValues extends FieldValues = FieldValues,
  TContext = unknown,
  TTransformedValues = TFieldValues,
> extends Omit<ComponentProps<'form'>, 'onSubmit' | 'onInvalid'> {
  /** `useForm(...)` natijasi */
  form: UseFormReturn<TFieldValues, TContext, TTransformedValues>;
  /** Validatsiyadan o'tgan (resolver o'zgartirgan) qiymatlar bilan chaqiriladi */
  onSubmit: SubmitHandler<TTransformedValues>;
  /** Validatsiya xatosi bo'lsa */
  onInvalid?: SubmitErrorHandler<TFieldValues>;
}

/**
 * `<form>` + `FormProvider`: `onSubmit` → `form.handleSubmit`, brauzer validatsiyasi o'chirilgan
 * (`noValidate`) — xatolar `FormField` ichida ko'rsatiladi.
 * @example
 * const form = useForm({ resolver: zodResolver(schema), defaultValues });
 * <Form form={form} onSubmit={save}>...</Form>
 */
export function Form<
  TFieldValues extends FieldValues = FieldValues,
  TContext = unknown,
  TTransformedValues = TFieldValues,
>({
  form,
  onSubmit,
  onInvalid,
  children,
  ...props
}: FormProps<TFieldValues, TContext, TTransformedValues>) {
  return (
    <FormProvider {...form}>
      <form noValidate {...props} onSubmit={form.handleSubmit(onSubmit, onInvalid)}>
        {children}
      </form>
    </FormProvider>
  );
}

export type FormSubmitProps = ButtonProps;

/**
 * `Button type="submit"`: yuborilayotganda (`isSubmitting`) — `loading`. Default `variant="primary"`.
 * @example <FormSubmit>Saqlash</FormSubmit>
 */
export function FormSubmit({ variant = 'primary', loading, ...props }: FormSubmitProps) {
  const { isSubmitting } = useFormState();
  return <Button type="submit" variant={variant} loading={loading || isSubmitting} {...props} />;
}

export interface FormRootErrorProps extends Omit<AlertProps, 'children'> {
  /** Matn o'rniga o'z ko'rinishingiz (xato matni argument sifatida) */
  children?: (message: string) => ReactNode;
}

/**
 * Forma darajasidagi xato (`setError('root', ...)` yoki `setError('root.server', ...)`) —
 * `Alert color="danger"`. Xato bo'lmasa hech narsa chizmaydi.
 * @example form.setError('root', { message: 'Server javob bermadi' }); <FormRootError />
 */
export function FormRootError({ children, color = 'danger', ...props }: FormRootErrorProps) {
  const { errors } = useFormState();
  const root = errors.root;
  let message = root?.message;
  if (!message && root) {
    for (const value of Object.values(root)) {
      if (value && typeof value === 'object' && 'message' in value && value.message) {
        message = String(value.message);
        break;
      }
    }
  }
  if (!message) return null;
  return (
    <Alert data-slot="form-root-error" color={color} {...props}>
      {children ? children(message) : message}
    </Alert>
  );
}
