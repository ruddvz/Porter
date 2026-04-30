-- Porter dev seed: run after migration. Requires at least one auth.users row (sign up via app).
do $$
declare
  uid uuid;
  sid uuid;
  cid1 uuid;
  cid2 uuid;
  cid3 uuid;
  oid1 uuid;
  oid2 uuid;
  oid3 uuid;
begin
  select id into uid from auth.users order by created_at asc limit 1;
  if uid is null then
    raise notice 'Skipping seed: no auth.users. Sign up at /auth/signup then re-run.';
    return;
  end if;

  select id into sid from public.sellers where user_id = uid limit 1;
  if sid is null then
    insert into public.sellers (
      user_id, store_name, whatsapp_number, city, delivery_zones, plan,
      meta_phone_number_id, is_active
    ) values (
      uid,
      'Shreeji Kirana — South Gujarat',
      '+919876543210',
      'Vadodara',
      array['Manjalpur', 'Akota', 'Gotri', 'Alkapuri', 'Sayajigunj'],
      'starter',
      'demo_meta_phone_id',
      true
    )
    returning id into sid;
  end if;

  delete from public.products where seller_id = sid;

  insert into public.products (seller_id, name, aliases, category, price, unit, in_stock)
  values
    (sid, 'Potato', array['bataka', 'aloo', 'potato', 'bateta'], 'vegetables', 28, 'kg', true),
    (sid, 'Onion', array['duungli', 'pyaz', 'kanda', 'onion'], 'vegetables', 40, 'kg', true),
    (sid, 'Tomato', array['tametu', 'tamatar', 'tomato'], 'vegetables', 50, 'kg', true),
    (sid, 'Coriander', array['dhana', 'dhaniya', 'coriander', 'cilantro'], 'vegetables', 15, 'pkt', true),
    (sid, 'Green Chili', array['marcha', 'mirchi', 'chili'], 'vegetables', 20, 'pkt', true),
    (sid, 'Garlic', array['lasan', 'lehsun', 'garlic'], 'vegetables', 200, 'kg', true),
    (sid, 'Ginger', array['adu', 'adrak', 'ginger'], 'vegetables', 120, 'kg', true),
    (sid, 'Amul Butter', array['makhan', 'butter', 'amul'], 'dairy', 56, 'piece', true),
    (sid, 'Amul Milk', array['dudh', 'milk', 'taaza'], 'dairy', 28, 'litre', true),
    (sid, 'Curd', array['dahi', 'curd', 'yogurt'], 'dairy', 40, 'pkt', true),
    (sid, 'Paneer', array['paneer', 'cottage cheese'], 'dairy', 320, 'pkt', true),
    (sid, 'Sunflower Oil', array['tel', 'oil', 'saffola', 'fortune'], 'household', 180, 'litre', true),
    (sid, 'Toor Dal', array['tuver', 'arhar', 'pigeon pea'], 'grocery', 140, 'kg', true),
    (sid, 'Rice', array['chokha', 'chawal', 'basmati'], 'grocery', 85, 'kg', true),
    (sid, 'Wheat Flour', array['atta', 'gehu', 'flour'], 'grocery', 48, 'kg', true),
    (sid, 'Sugar', array['khand', 'cheeni', 'sugar'], 'grocery', 45, 'kg', true),
    (sid, 'Salt', array['mithu', 'namak', 'salt'], 'grocery', 22, 'pkt', true),
    (sid, 'Tea', array['chai', 'chaa', 'tea'], 'grocery', 95, 'pkt', true),
    (sid, 'Biscuits', array['biskut', 'parle-g', 'cookies'], 'snacks', 30, 'pkt', true),
    (sid, 'Eggs', array['anda', 'eggs'], 'dairy', 72, 'dozen', true);

  if exists (select 1 from public.orders where seller_id = sid limit 1) then
    return;
  end if;

  insert into public.customers (seller_id, phone_number, name, default_area, order_count)
  values
    (sid, '+919811111111', 'Rameshbhai', 'Manjalpur', 2)
  returning id into cid1;

  insert into public.customers (seller_id, phone_number, name, default_area, order_count)
  values (sid, '+919822222222', 'Sunita', 'Akota', 1)
  returning id into cid2;

  insert into public.customers (seller_id, phone_number, name, default_area, order_count)
  values (sid, '+919833333333', 'Jayesh', 'Gotri', 0)
  returning id into cid3;

  insert into public.orders (
    seller_id, customer_id, customer_name, customer_phone, delivery_area, delivery_address,
    total_amount, status, payment_method, payment_status, created_at
  ) values
    (sid, cid1, 'Rameshbhai', '+919811111111', 'Manjalpur', 'Sunshine Apt B-204', 186,
     'confirmed', 'razorpay', 'paid', now() - interval '2 hours')
  returning id into oid1;

  insert into public.orders (
    seller_id, customer_id, customer_name, customer_phone, delivery_area, delivery_address,
    total_amount, status, payment_method, payment_status, created_at
  ) values
    (sid, cid2, 'Sunita', '+919822222222', 'Akota', '12, Shanti Society', 95,
     'out_for_delivery', 'cod', 'cod_pending', now() - interval '30 minutes')
  returning id into oid2;

  insert into public.orders (
    seller_id, customer_id, customer_name, customer_phone, delivery_area, delivery_address,
    total_amount, status, payment_method, payment_status, created_at, paid_at, delivered_at
  ) values
    (sid, cid3, 'Jayesh', '+919833333333', 'Gotri', 'Plot 44', 320,
     'delivered', 'razorpay', 'paid', now() - interval '1 day', now() - interval '1 day', now() - interval '12 hours')
  returning id into oid3;

  insert into public.order_items (order_id, product_name, quantity, unit, unit_price, total_price)
  values
    (oid1, 'Potato', 5, 'kg', 28, 140),
    (oid1, 'Amul Butter', 1, 'piece', 56, 56);

  insert into public.order_items (order_id, product_name, quantity, unit, unit_price, total_price)
  values (oid2, 'Tea', 1, 'pkt', 95, 95);

  insert into public.order_items (order_id, product_name, quantity, unit, unit_price, total_price)
  values (oid3, 'Paneer', 1, 'pkt', 320, 320);
end $$;
