'use client'

const FIX_SQL = [
  "CREATE OR REPLACE FUNCTION handle_new_user()",
  "RETURNS TRIGGER AS $func$",
  "BEGIN",
  "  INSERT INTO profiles (id, display_name, avatar_url)",
  "  VALUES (",
  "    NEW.id,",
  "    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),",
  "    NEW.raw_user_meta_data->>'avatar_url'",
  "  ) ON CONFLICT (id) DO NOTHING;",
  "  RETURN NEW;",
  "END;",
  "$func$ LANGUAGE plpgsql SECURITY DEFINER;",
  "",
  "DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;",
  "CREATE TRIGGER on_auth_user_created",
  "  AFTER INSERT ON auth.users",
  "  FOR EACH ROW EXECUTE FUNCTION handle_new_user();",
].join('\n')

export default function SetupPage() {
  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif', maxWidth: 600, margin: '0 auto' }}>
      <h1 style={{ fontSize: 20, marginBottom: 8 }}>Fix Database Trigger</h1>
      <p style={{ marginBottom: 16, color: '#666', fontSize: 14 }}>
        Copia il testo qui sotto e incollalo nel <strong>SQL Editor di Supabase</strong>, poi clicca Run.
      </p>
      <textarea
        readOnly
        defaultValue={FIX_SQL}
        onClick={e => (e.target as HTMLTextAreaElement).select()}
        style={{
          width: '100%',
          height: 320,
          fontFamily: 'monospace',
          fontSize: 13,
          padding: 12,
          border: '1px solid #ccc',
          borderRadius: 6,
          background: '#f5f5f5',
          boxSizing: 'border-box',
          resize: 'none',
        }}
      />
      <p style={{ marginTop: 12, color: '#666', fontSize: 13 }}>
        Tocca il testo → seleziona tutto → copia. Poi vai su Supabase → SQL Editor → incolla → Run.
      </p>
    </div>
  )
}
