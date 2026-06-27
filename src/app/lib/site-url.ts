const PRODUCTION_SITE_URL = 'https://personalcafe.netlify.app'

function parseSiteUrl(value: string) {
  try {
    return new URL(value)
  } catch {
    return null
  }
}

export function getPasswordResetRedirectUrl() {
  const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  const configuredUrl = configuredSiteUrl ? parseSiteUrl(configuredSiteUrl) : null

  if (
    configuredUrl &&
    (process.env.NODE_ENV !== 'production' ||
      (configuredUrl.protocol === 'https:' && configuredUrl.hostname !== 'localhost'))
  ) {
    return new URL('/reset-password', configuredUrl).toString()
  }

  if (process.env.NODE_ENV === 'production') {
    return `${PRODUCTION_SITE_URL}/reset-password`
  }

  return `${window.location.origin}/reset-password`
}
