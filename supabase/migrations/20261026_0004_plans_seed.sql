-- Plans reference data. Idempotent: safe to re-run.
-- Amounts in cents, EUR. USD uses the same numbers.

insert into public.plans (id, name, setup_fee_cents, monthly_cents, currency, product_limit, rule_limit, member_limit, pilot_days, sort)
values
  ('free_pilot', 'Free pilot',  0,         0,       'EUR', 5,    1,    null, 30,   1),
  ('founding',   'Founding',    50000,     150000,  'EUR', null, null, null, null, 2),
  ('starter',    'Starter',     750000,    350000,  'EUR', 150,  null, null, null, 3),
  ('growth',     'Growth',      1000000,   600000,  'EUR', 500,  null, null, null, 4),
  ('scale',      'Scale',       1500000,   900000,  'EUR', null, null, null, null, 5)
on conflict (id) do update set
  name            = excluded.name,
  setup_fee_cents = excluded.setup_fee_cents,
  monthly_cents   = excluded.monthly_cents,
  currency        = excluded.currency,
  product_limit   = excluded.product_limit,
  rule_limit      = excluded.rule_limit,
  member_limit    = excluded.member_limit,
  pilot_days      = excluded.pilot_days,
  sort            = excluded.sort;
