export function getAppDomain(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '');
  }
  if (typeof window !== 'undefined' && window.location.origin) {
    return window.location.origin;
  }
  return 'https://creator-attribution-dashboard.vercel.app';
}

export function generateShortSlug(title: string): string {
  const cleanTitle = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

  const truncated = cleanTitle.substring(0, 25).replace(/-$/, '');
  const randomSuffix = Math.random().toString(36).substring(2, 6);

  return `${truncated}-${randomSuffix}`;
}
