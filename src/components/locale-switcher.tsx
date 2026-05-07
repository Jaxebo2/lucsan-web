'use client'

import { useLocale, useTranslations } from 'next-intl'
import { usePathname, useRouter } from '@/i18n/routing'
import { Button } from '@/components/ui/button'

export function LocaleSwitcher() {
  const t = useTranslations('Common')
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  const switchTo = (target: 'es' | 'en') => {
    router.replace(pathname, { locale: target })
  }

  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        variant={locale === 'es' ? 'default' : 'outline'}
        onClick={() => switchTo('es')}
        aria-current={locale === 'es' ? 'true' : undefined}
      >
        {t('switchToSpanish')}
      </Button>
      <Button
        size="sm"
        variant={locale === 'en' ? 'default' : 'outline'}
        onClick={() => switchTo('en')}
        aria-current={locale === 'en' ? 'true' : undefined}
      >
        {t('switchToEnglish')}
      </Button>
    </div>
  )
}
