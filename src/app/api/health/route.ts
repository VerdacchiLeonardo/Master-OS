import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

  const urlOk = url.startsWith('https://') && !url.includes('placeholder')
  const keyOk = key.length > 20 && !key.includes('placeholder')

  let supabaseReachable = false
  let supabaseError = ''

  if (urlOk) {
    try {
      const res = await fetch(`${url}/auth/v1/settings`, {
        headers: { apikey: key },
        signal: AbortSignal.timeout(5000),
      })
      supabaseReachable = res.ok
      if (!res.ok) supabaseError = `HTTP ${res.status}`
    } catch (e) {
      supabaseError = e instanceof Error ? e.message : String(e)
    }
  }

  return NextResponse.json({
    supabase_url: urlOk ? `${url.slice(0, 30)}...` : 'MISSING / PLACEHOLDER',
    anon_key_set: keyOk,
    supabase_reachable: supabaseReachable,
    supabase_error: supabaseError || null,
  })
}
