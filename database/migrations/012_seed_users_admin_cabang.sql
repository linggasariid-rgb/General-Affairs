-- ============================================================
-- SEED USER ADMIN CABANG (KCB) - Email/Password Login
-- ============================================================
-- Email format: who{lower(kode_cabang)}@ga-enterprise.local
-- Password: password123 (harap diubah setelah login pertama)
-- ============================================================
DO $$
DECLARE
    r record;
    v_user_id uuid;
    v_role_id uuid;
    v_email text;
BEGIN
    -- Get KCB role ID
    SELECT id INTO v_role_id FROM roles WHERE kode = 'KCB';
    IF v_role_id IS NULL THEN
        RAISE EXCEPTION 'Role KCB tidak ditemukan';
    END IF;

    FOR r IN SELECT * FROM cabang WHERE status = true ORDER BY kode
    LOOP
        v_email := 'who' || lower(r.kode) || '@ga-enterprise.local';

        -- Skip if already exists
        IF EXISTS (SELECT 1 FROM auth.users WHERE email = v_email) THEN
            RAISE NOTICE 'SKIP: User % already exists', v_email;
            CONTINUE;
        END IF;

        -- Generate new UUID
        v_user_id := gen_random_uuid();

        -- Insert into auth.users (Supabase Auth)
        INSERT INTO auth.users (
            instance_id, id, aud, role, email, encrypted_password,
            email_confirmed_at, confirmation_sent_at,
            raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
            confirmation_token, recovery_token, email_change, email_change_token_new,
            is_sso_user, is_anonymous
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            v_user_id,
            'authenticated',
            'authenticated',
            v_email,
            crypt('password123', gen_salt('bf')),
            now(), now(),
            '{"provider":"email","providers":["email"]}',
            jsonb_build_object('nama', 'Admin Cabang ' || r.nama),
            now(), now(),
            '', '', '', '',
            false, false
        );

        -- Insert into public.users
        INSERT INTO users (id, email, nama, id_role, id_cabang, is_active, auth_provider)
        VALUES (
            v_user_id,
            v_email,
            'Admin Cabang ' || r.nama,
            v_role_id,
            r.id,
            true,
            'email'
        );

        RAISE NOTICE 'CREATED: % - % (% - %)', r.kode, r.nama, v_email, 'Admin Cabang ' || r.nama;
    END LOOP;
END $$;
