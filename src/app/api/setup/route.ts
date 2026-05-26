import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    return NextResponse.json({ error: 'Missing env vars' }, { status: 500 })
  }

  const supabase = createClient(url, serviceKey)

  const { error } = await supabase.rpc('exec_sql' as never, {
    sql: `
      CREATE OR REPLACE FUNCTION handle_new_user()
      RETURNS TRIGGER AS $func$
      BEGIN
        INSERT INTO profiles (id, display_name, avatar_url)
        VALUES (
          NEW.id,
          COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
          NEW.raw_user_meta_data->>'avatar_url'
        );
        RETURN NEW;
      END;
      $func$ LANGUAGE plpgsql SECURITY DEFINER;

      DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
      CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW EXECUTE FUNCTION handle_new_user();
    `
  })

  if (error) {
    return NextResponse.json({ error: error.message, hint: 'exec_sql RPC not available, use SQL editor' }, { status: 500 })
  }

  return NextResponse.json({ ok: true, message: 'Trigger created successfully' })
}
