import { AuthShell } from '@/components/examples/auth/auth-shell';

export default async function AuthLayout({
  params,
  children,
}: LayoutProps<'/[lang]/examples/auth'>) {
  const { lang } = await params;
  return <AuthShell lang={lang}>{children}</AuthShell>;
}
