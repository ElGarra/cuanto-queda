import { customAlphabet } from 'nanoid'

const nanoId = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 4)

function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function generateWeddingSlug(name1: string, name2: string): string {
  return `${slugify(name1)}-y-${slugify(name2)}-${nanoId()}`
}

export const RESERVED_SLUGS = new Set([
  'admin', 'couple', 'api', 'i', '_next', 'static', 'favicon.ico',
])

export function isValidSlug(slug: string): boolean {
  return !RESERVED_SLUGS.has(slug) && /^[a-z0-9-]+$/.test(slug) && slug.length >= 3
}
