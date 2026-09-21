-- =============================================================
-- Finvoq — Supabase Postgres seed data
-- Run after schema.sql. Safe to re-run (uses ON CONFLICT DO NOTHING).
-- =============================================================

-- Indices
insert into public.indices (id, name, price, chg) values
  ('ix-nifty',  'NIFTY 50',    22530.70, 1.35),
  ('ix-sensex', 'SENSEX',      74119.39, 0.92),
  ('ix-bank',   'BANK NIFTY',  48650.15, -0.34),
  ('ix-vix',    'India VIX',   13.28,    -2.10)
on conflict (id) do nothing;

-- Ticker
insert into public.ticker_items (name, price, chg) values
  ('NIFTY 50',   22530.70,  1.35),
  ('SENSEX',     74119.39,  0.92),
  ('BANK NIFTY', 48650.15, -0.34),
  ('INDIA VIX',  13.28,    -2.10),
  ('GOLD MCX',   72480,    -0.28),
  ('SILVER MCX', 84120,     0.45),
  ('USDINR',     83.42,     0.12),
  ('BRENT',      84.65,    -0.55),
  ('NASDAQ',     17891.22,  1.10),
  ('BTC/INR',    5612340,   2.34)
on conflict (name) do nothing;

-- Stocks
insert into public.stocks (sym, name, price, chg, vol, cap, cat) values
  ('RELIANCE',  'Reliance Ind.',  2840.55,  1.42, '8.2M', '₹19.2L Cr', 'up'),
  ('TCS',       'TCS',            3920.10,  0.85, '2.4M', '₹14.3L Cr', 'up'),
  ('HDFCBANK',  'HDFC Bank',      1672.30, -0.32, '6.8M', '₹12.7L Cr', 'stable'),
  ('INFY',      'Infosys',        1845.65,  1.10, '4.1M', '₹7.6L Cr',  'up'),
  ('ICICIBANK', 'ICICI Bank',     1140.80,  0.62, '5.5M', '₹8.0L Cr',  'watch'),
  ('BHARTIARTL','Bharti Airtel',  1485.40,  2.15, '3.2M', '₹8.4L Cr',  'up'),
  ('LT',        'L&T',            3580.25, -0.18, '1.9M', '₹4.9L Cr',  'stable'),
  ('ASIANPAINT','Asian Paints',   2895.70, -0.95, '0.9M', '₹2.8L Cr',  'watch'),
  ('MARUTI',    'Maruti Suzuki',  12480.00, 1.62, '0.4M', '₹3.9L Cr',  'up')
on conflict (sym) do nothing;

-- Unlisted
insert into public.unlisted_shares (name, domain, sector, brand, initial, price, iv, tag) values
  ('Oyo Hotels',      'oyorooms.com',          'Hospitality',   '#EE2E24', 'O',  54,    '+12.5%', 'trend'),
  ('NSE India',       'nseindia.com',          'Exchange',      '#F58220', 'N',  3850,  '+8.2%',  'trend'),
  ('Pharmeasy',       'pharmeasy.in',          'Healthtech',    '#10847E', 'P',  8.5,   '-3.4%',  'avail'),
  ('CSK',             'chennaisuperkings.com', 'Sports',        '#FFCD00', 'C',  204,   '+18.6%', 'trend'),
  ('BOAT',            'boat-lifestyle.com',    'Consumer Tech', '#111111', 'b',  1450,  '+5.2%',  'avail'),
  ('Tata Capital',    'tatacapital.com',       'NBFC',          '#486AAB', 'T',  920,   '+9.8%',  'lim'),
  ('HDB Financial',   'hdbfs.com',             'NBFC',          '#004C8F', 'H',  1180,  '+11.2%', 'avail'),
  ('Swiggy',          'swiggy.com',            'Foodtech',      '#FC8019', 'S',  430,   '+22.1%', 'lim'),
  ('Reliance Retail', 'relianceretail.com',    'Retail',        '#0E3F76', 'R',  1380,  '+15.0%', 'trend')
on conflict (name) do nothing;

-- Products
insert into public.products (title, icon, body, cta, soon, position) values
  ('Equities',           'i-trending-up', 'Track listed shares with live price feeds, sparkline trends, and watchlist-driven discovery.',           'Explore',     false, 1),
  ('Unlisted Shares',    'i-lock',        'Access curated pre-IPO and private market opportunities with advisor-assisted execution.',                'Explore',     false, 2),
  ('Mutual Funds',       'i-bar-chart',   'SIP & lump sum across 40+ AMCs. Goal-based planning with built-in calculators.',                          'Explore',     false, 3),
  ('PMS & AIF',          'i-gem',         'Portfolio management services and alternative investment funds for HNI and UHNI investors.',              'Explore',     false, 4),
  ('Bonds & G-Sec',      'i-building',    'Government securities, corporate bonds, tax-free bonds, and NCD opportunities.',                          'Explore',     false, 5),
  ('Insurance',          'i-shield',      'Term life, health, and ULIP products from top insurers with comparison tools.',                           'Explore',     false, 6),
  ('Real Estate',        'i-home',        'Fractional real estate and REIT opportunities for portfolio diversification.',                            'Coming Soon', true,  7),
  ('Gold & Commodities', 'i-coin',        'Digital gold, sovereign gold bonds, and commodity ETFs for safe-haven allocation.',                       'Explore',     false, 8)
on conflict (title) do nothing;

-- Testimonials
insert into public.testimonials (quote, author, role, color, initials, position) values
  ('Finally a platform that treats unlisted shares with the same rigor as listed ones. The diligence is exceptional.', 'Aarav Shah',    'Founder, Lumen Studios',                  '#0E3F76', 'AS', 1),
  ('I moved my entire portfolio over after my first call with their advisor. The depth of research is unmatched.',     'Priya Kapoor',  'Director, MIT-K Capital',                 '#7c3aed', 'PK', 2),
  ('Most platforms feel like brokerage apps. Finvoq actually feels like a private bank — without the markup.',       'Vikram Iyer',   'Managing Partner, Iyer Family Office',    '#01696f', 'VI', 3),
  ('The unified dashboard alone saves me three hours a week. I can finally see every asset class in one place.',       'Neha Reddy',    'CFO, Zenith Health',                      '#ea7c1c', 'NR', 4),
  ('I''ve been investing for 25 years. This is the first platform that actually serves me, not the other way around.', 'Rajesh Bansal', 'Retd. Senior Banker',                     '#16a34a', 'RB', 5),
  ('The PMS access alone justifies the platform. The team made onboarding feel personal — rare these days.',           'Karan Mehta',   'Founder, Stride Ventures',                '#dc2626', 'KM', 6);

-- FAQs
insert into public.faqs (q, a, position) values
  ('What is Finvoq?',
   'Finvoq is a multi-asset investment platform that helps investors discover, evaluate and access curated investment opportunities across listed and unlisted equities, mutual funds, PMS, AIFs, bonds and other asset classes.',
   1),
  ('Can I invest in unlisted and pre-IPO shares through Finvoq?',
   'Yes. Finvoq provides access to selected unlisted and pre-IPO opportunities, along with research and relevant transaction information to help investors make informed decisions.',
   2),
  ('How does Finvoq select investment opportunities?',
   'Finvoq follows a research-led approach, evaluating opportunities across factors such as business fundamentals, financial performance, valuation, risks and overall investment suitability before presenting them to investors.',
   3),
  ('Are investments made through Finvoq risk-free?',
   'No. Every investment carries risk. Unlisted shares, in particular, can involve lower liquidity, limited price discovery, valuation risk and uncertainty around future IPO or listing timelines.',
   4),
  ('Does Finvoq offer investments beyond unlisted shares?',
   'Yes. Investors can explore multiple asset classes through Finvoq, including listed equities, mutual funds, PMS, AIFs, bonds, fixed deposits, insurance and GIFT City opportunities.',
   5),
  ('How can I start investing with Finvoq?',
   'You can get started by creating an account with Finvoq. Based on your investment goals, time horizon and portfolio requirements, you can then explore suitable opportunities and connect with the Finvoq team for assistance.',
   6);
