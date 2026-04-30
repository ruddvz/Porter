-- Porter admin schema (Session 2). RLS: restrict to service role in production.

CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  email text NOT NULL,
  role text NOT NULL CHECK (role IN ('super_admin', 'support')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS admin_users_user_id_idx ON admin_users (user_id);

CREATE TABLE IF NOT EXISTS platform_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES admin_users (id) ON DELETE SET NULL,
  event_type text NOT NULL,
  target_seller_id uuid,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS platform_events_created_at_idx ON platform_events (created_at DESC);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_events ENABLE ROW LEVEL SECURITY;

-- No policies for anon/authenticated: default deny. Supabase service_role bypasses RLS.

COMMENT ON TABLE admin_users IS 'Porter staff; use service role from server only.';
COMMENT ON TABLE platform_events IS 'Audit log; use service role from server only.';
