import { NextIntlClientProvider, hasLocale } from 'next-intl'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import { PostHogProvider } from '@/components/posthog-provider'

export default async function PortalLocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()

  return (
    <NextIntlClientProvider locale={locale}>
      <PostHogProvider>
        <div className="min-h-screen bg-muted/30">{children}</div>
      </PostHogProvider>
    </NextIntlClientProvider>
  )
}
