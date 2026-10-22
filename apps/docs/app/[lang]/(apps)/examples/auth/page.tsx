import { redirect } from 'next/navigation';

/** Namunaning bosh sahifasi — kirish formasi */
export default async function AuthIndex({ params }: PageProps<'/[lang]/examples/auth'>) {
  const { lang } = await params;
  redirect(`/${lang}/examples/auth/sign-in`);
}
