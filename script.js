/* =========================================================
   PECULIEX — interactivity + motion
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  const $  = (s, p = document) => p.querySelector(s);
  const $$ = (s, p = document) => Array.from(p.querySelectorAll(s));
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const lerp = (a, b, t) => a + (b - a) * t;
  const fmtINR = (n) => '₹' + Math.round(n).toLocaleString('en-IN');

  /* ─── Year ─────────────────────────────────── */
  $('#year').textContent = new Date().getFullYear();

  /* ─── Preloader ───────────────────────────── */
  const dismissPreloader = () => $('#preloader')?.classList.add('gone');
  // Dismiss as soon as the window load event fires …
  if (document.readyState === 'complete') {
    setTimeout(dismissPreloader, 400);
  } else {
    window.addEventListener('load', () => setTimeout(dismissPreloader, 600));
  }
  // … and force-dismiss after a hard cap so a slow logo / network never blocks the hero.
  setTimeout(dismissPreloader, 2200);

  /* ─── Custom Cursor (lerp follower) ───────── */
  if (matchMedia('(pointer: fine)').matches && !reduceMotion) {
    const dot = $('#cursorDot'), ring = $('#cursorRing');
    let mx = innerWidth/2, my = innerHeight/2;
    let rx = mx, ry = my, dx = mx, dy = my;
    addEventListener('mousemove', (e) => { mx = e.clientX; my = e.clientY; });
    const tick = () => {
      dx = lerp(dx, mx, .35); dy = lerp(dy, my, .35);
      rx = lerp(rx, mx, .14); ry = lerp(ry, my, .14);
      dot.style.transform  = `translate(${dx}px, ${dy}px) translate(-50%,-50%)`;
      ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%,-50%)`;
      requestAnimationFrame(tick);
    };
    tick();
    const hovers = 'a, button, .product, .stock, .unl-card, .insight, .kpi, .chip, [data-magnetic], input, select, textarea, .dash-menu li';
    $$(hovers).forEach(el => {
      el.addEventListener('mouseenter', () => { ring.classList.add('hover'); dot.classList.add('hover'); });
      el.addEventListener('mouseleave', () => { ring.classList.remove('hover'); dot.classList.remove('hover'); });
    });
  }

  /* ─── Magnetic buttons ────────────────────── */
  if (!reduceMotion) {
    $$('[data-magnetic]').forEach((el) => {
      const strength = 22;
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - r.left - r.width/2;
        const y = e.clientY - r.top  - r.height/2;
        el.style.transform = `translate(${(x/r.width)*strength}px, ${(y/r.height)*strength}px)`;
      });
      el.addEventListener('mouseleave', () => el.style.transform = '');
    });
  }

  /* ─── Tilt cards (3D pointer parallax) ────── */
  if (!reduceMotion) {
    const tiltEls = $$('[data-tilt], [data-tilt-strong]');
    tiltEls.forEach(el => {
      const strong = el.hasAttribute('data-tilt-strong');
      const max = strong ? 6 : 9;
      el.style.transformStyle = 'preserve-3d';
      el.style.transition = 'transform .25s ease';
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width  - .5;
        const py = (e.clientY - r.top)  / r.height - .5;
        el.style.transform = `perspective(1100px) rotateX(${(-py*max).toFixed(2)}deg) rotateY(${(px*max).toFixed(2)}deg) translateZ(0)`;
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = '';
      });
    });
  }

  /* ─── Nav scroll state ────────────────────── */
  const nav = $('#mainNav');
  const onScroll = () => {
    nav.classList.toggle('scrolled', scrollY > 30);
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* ─── Smooth scroll w/ offset ─────────────── */
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const t = $(id);
      if (!t) return;
      e.preventDefault();
      const top = t.getBoundingClientRect().top + scrollY - 70;
      scrollTo({ top, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  });

  /* ─── Reveal-on-scroll observer ───────────── */
  const io = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        en.target.classList.add('visible');
        io.unobserve(en.target);
      }
    });
  }, { threshold: .14, rootMargin: '0px 0px -60px 0px' });
  $$('.reveal').forEach(el => io.observe(el));

  /* ─── Hero title char-split reveal ─────────── */
  (() => {
    const title = $('#heroTitle');
    if (!title) return;
    const segs = title.querySelectorAll('.seg');
    let total = 0;
    segs.forEach((seg) => {
      const text = seg.textContent;
      seg.textContent = '';
      const words = text.split(' ');
      words.forEach((word, wIdx) => {
        const wordSpan = document.createElement('span');
        wordSpan.style.whiteSpace = 'nowrap';
        [...word].forEach((ch) => {
          const span = document.createElement('span');
          span.className = 'char';
          span.textContent = ch;
          span.style.transitionDelay = (total * 22) + 'ms';
          wordSpan.appendChild(span);
          total++;
        });
        seg.appendChild(wordSpan);
        if (wIdx < words.length - 1) {
          const space = document.createElement('span');
          space.className = 'char';
          space.textContent = '\u00A0';
          space.style.transitionDelay = (total * 22) + 'ms';
          seg.appendChild(space);
          total++;
        }
      });
    });
    setTimeout(() => title.classList.add('in'), 250);
  })();

  /* ─── Hero spotlight (mouse-tracked) ───────── */
  (() => {
    const hero = $('#hero'); const spot = $('#heroSpotlight');
    if (!hero || !spot || reduceMotion) return;
    let tx = 0.7, ty = 0.3, x = tx, y = ty;
    hero.addEventListener('mousemove', (e) => {
      const r = hero.getBoundingClientRect();
      tx = (e.clientX - r.left) / r.width;
      ty = (e.clientY - r.top) / r.height;
    });
    const tick = () => {
      x = lerp(x, tx, .08); y = lerp(y, ty, .08);
      spot.style.setProperty('--sx', (x * 100).toFixed(2) + '%');
      spot.style.setProperty('--sy', (y * 100).toFixed(2) + '%');
      requestAnimationFrame(tick);
    };
    tick();
  })();

  /* ─── Hero stage multi-card depth parallax ── */
  (() => {
    const stage = $('#heroStage');
    if (!stage || reduceMotion) return;
    const cards = $$('.hero-card', stage);
    const baseTransforms = new Map();
    cards.forEach(c => baseTransforms.set(c, getComputedStyle(c).transform));
    stage.addEventListener('mousemove', (e) => {
      const r = stage.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - .5;
      const py = (e.clientY - r.top) / r.height - .5;
      cards.forEach((c) => {
        const d = parseFloat(c.dataset.depth) || 1;
        c.style.setProperty('--mx', (px * d * 18).toFixed(2) + 'px');
        c.style.setProperty('--my', (py * d * 18).toFixed(2) + 'px');
        c.style.translate = `${(px * d * 18).toFixed(2)}px ${(py * d * 18).toFixed(2)}px`;
      });
    });
    stage.addEventListener('mouseleave', () => {
      cards.forEach((c) => { c.style.translate = '0 0'; });
    });
  })();

  /* ─── Allocation rings animate on view ────── */
  (() => {
    const svg = $('#allocRings');
    if (!svg) return;
    const rings = [
      { el: $('#ring1', svg), r: 58, pct: 0.42 },
      { el: $('#ring2', svg), r: 46, pct: 0.22 },
      { el: $('#ring3', svg), r: 34, pct: 0.14 },
    ];
    const animate = () => {
      rings.forEach(({ el, r, pct }) => {
        const C = 2 * Math.PI * r;
        el.setAttribute('stroke-dasharray', `${(C * pct).toFixed(2)} ${C}`);
      });
    };
    new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (en.isIntersecting) { animate(); }
      });
    }, { threshold: .3 }).observe(svg);
  })();

  /* ─── Counter numbers ─────────────────────── */
  const counters = $$('.counter');
  const cIO = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      const el = en.target;
      const target = parseFloat(el.dataset.target);
      const suffix = el.dataset.suffix || '';
      const dur = 1600; const start = performance.now();
      const ease = (t) => 1 - Math.pow(1 - t, 3);
      const step = (now) => {
        const t = Math.min(1, (now - start) / dur);
        const v = target * ease(t);
        el.textContent = (v >= 1000 ? Math.round(v).toLocaleString('en-IN') : v.toFixed(0)) + suffix;
        if (t < 1) requestAnimationFrame(step);
        else el.textContent = (target >= 1000 ? Math.round(target).toLocaleString('en-IN') : target) + suffix;
      };
      requestAnimationFrame(step);
      cIO.unobserve(el);
    });
  }, { threshold: .4 });
  counters.forEach(c => cIO.observe(c));

  /* ─── Parallax (data-parallax="0.1") ──────── */
  const parallaxEls = $$('[data-parallax]');
  if (!reduceMotion && parallaxEls.length) {
    addEventListener('scroll', () => {
      const y = scrollY;
      parallaxEls.forEach(el => {
        const k = parseFloat(el.dataset.parallax) || .1;
        el.style.translate = `0 ${(y * k).toFixed(1)}px`;
      });
    }, { passive: true });
  }

  /* ─── Top Ticker (live-ish) ───────────────── */
  const baseTicker = [
    { name: 'NIFTY 50',   price: 22530.70, chg: +1.35 },
    { name: 'SENSEX',     price: 74119.39, chg: +0.92 },
    { name: 'BANK NIFTY', price: 48650.15, chg: -0.34 },
    { name: 'INDIA VIX',  price: 13.28,    chg: -2.10 },
    { name: 'GOLD MCX',   price: 72480,    chg: -0.28 },
    { name: 'SILVER MCX', price: 84120,    chg: +0.45 },
    { name: 'USDINR',     price: 83.42,    chg: +0.12 },
    { name: 'BRENT',      price: 84.65,    chg: -0.55 },
    { name: 'NASDAQ',     price: 17891.22, chg: +1.10 },
    { name: 'BTC/INR',    price: 5612340,  chg: +2.34 },
  ];
  const arrowSVG = (up) => `<svg class="trend-icon" aria-hidden="true"><use href="#i-arrow-${up ? 'up' : 'down'}"/></svg>`;

  const renderTicker = () => {
    const html = baseTicker.map(t => {
      const up = t.chg >= 0;
      const cls = up ? 'up' : 'dn';
      const price = t.price >= 1000 ? t.price.toLocaleString('en-IN', { maximumFractionDigits: 2 }) : t.price.toFixed(2);
      return `<div class="ticker-item">
        <span class="ticker-name">${t.name}</span>
        <span class="ticker-price">${price}</span>
        <span class="ticker-chg ${cls}">${arrowSVG(up)} ${Math.abs(t.chg).toFixed(2)}%</span>
      </div>`;
    }).join('');
    $('#tickerTrack').innerHTML = html + html; // duplicate for seamless loop
  };
  renderTicker();
  // Live nudge prices
  setInterval(() => {
    baseTicker.forEach(t => {
      const drift = (Math.random() - .5) * .08;
      t.price = +(t.price * (1 + drift / 100)).toFixed(2);
      t.chg   = +(t.chg + (Math.random() - .5) * .15).toFixed(2);
    });
    renderTicker();
  }, 3500);

  /* ─── Markets — Stock cards w/ sparklines ─── */
  const stocks = [
    { name: 'Reliance Ind.',  sym: 'RELIANCE', price: 2840.55, chg: +1.42, vol: '8.2M', cap: '₹19.2L Cr', cat: 'up'    },
    { name: 'TCS',            sym: 'TCS',      price: 3920.10, chg: +0.85, vol: '2.4M', cap: '₹14.3L Cr', cat: 'up'    },
    { name: 'HDFC Bank',      sym: 'HDFCBANK', price: 1672.30, chg: -0.32, vol: '6.8M', cap: '₹12.7L Cr', cat: 'stable'},
    { name: 'Infosys',        sym: 'INFY',     price: 1845.65, chg: +1.10, vol: '4.1M', cap: '₹7.6L Cr',  cat: 'up'    },
    { name: 'ICICI Bank',     sym: 'ICICIBANK',price: 1140.80, chg: +0.62, vol: '5.5M', cap: '₹8.0L Cr',  cat: 'watch' },
    { name: 'Bharti Airtel',  sym: 'BHARTIARTL',price:1485.40, chg: +2.15, vol: '3.2M', cap: '₹8.4L Cr',  cat: 'up'    },
    { name: 'L&T',            sym: 'LT',       price: 3580.25, chg: -0.18, vol: '1.9M', cap: '₹4.9L Cr',  cat: 'stable'},
    { name: 'Asian Paints',   sym: 'ASIANPAINT',price:2895.70, chg: -0.95, vol: '0.9M', cap: '₹2.8L Cr',  cat: 'watch' },
    { name: 'Maruti Suzuki',  sym: 'MARUTI',   price: 12480.00,chg: +1.62, vol: '0.4M', cap: '₹3.9L Cr',  cat: 'up'    },
  ];

  const sparkPath = (vals, w = 100, h = 50) => {
    const min = Math.min(...vals), max = Math.max(...vals), range = (max - min) || 1;
    return vals.map((v, i) => {
      const x = (i / (vals.length - 1)) * w;
      const y = h - ((v - min) / range) * h;
      return (i === 0 ? 'M' : 'L') + x.toFixed(1) + ',' + y.toFixed(1);
    }).join(' ');
  };
  const randomSpark = (seed = 0, n = 26) => {
    const arr = []; let v = 50 + seed;
    for (let i = 0; i < n; i++) { v += (Math.random() - .5) * 12; arr.push(v); }
    return arr;
  };

  const stockGrid = $('#stockGrid');
  stocks.forEach((s, i) => {
    const up = s.chg >= 0;
    const vals = randomSpark(i * 3);
    const card = document.createElement('article');
    card.className = 'stock reveal';
    card.dataset.cat = s.cat;
    card.innerHTML = `
      <div class="stock-head">
        <div>
          <div class="stock-name">${s.name}</div>
          <div class="stock-sym">${s.sym}</div>
        </div>
        <span class="stock-pill ${up ? 'up' : 'dn'}">${arrowSVG(up)} ${Math.abs(s.chg).toFixed(2)}%</span>
      </div>
      <div class="stock-price">
        <b>₹${s.price.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</b>
      </div>
      <svg class="stock-spark" viewBox="0 0 100 50" preserveAspectRatio="none">
        <defs>
          <linearGradient id="g${i}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="${up ? '#16a34a' : '#dc2626'}" stop-opacity=".25"/>
            <stop offset="100%" stop-color="${up ? '#16a34a' : '#dc2626'}" stop-opacity="0"/>
          </linearGradient>
        </defs>
        <path d="${sparkPath(vals)} L100,50 L0,50 Z" fill="url(#g${i})"/>
        <path d="${sparkPath(vals)}" fill="none" stroke="${up ? '#16a34a' : '#dc2626'}" stroke-width="1.6"/>
      </svg>
      <div class="stock-meta">
        <span>Vol ${s.vol}</span>
        <span>Mcap ${s.cap}</span>
      </div>`;
    stockGrid.appendChild(card);
    io.observe(card);
  });

  // Live price drift
  setInterval(() => {
    $$('#stockGrid .stock').forEach((el, i) => {
      const drift = (Math.random() - .5) * .12;
      stocks[i].price = +(stocks[i].price * (1 + drift / 100)).toFixed(2);
      stocks[i].chg   = +(stocks[i].chg + (Math.random() - .5) * .1).toFixed(2);
      const up = stocks[i].chg >= 0;
      const priceEl = el.querySelector('.stock-price b');
      const pillEl  = el.querySelector('.stock-pill');
      priceEl.textContent = '₹' + stocks[i].price.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2});
      pillEl.className = 'stock-pill ' + (up ? 'up' : 'dn');
      pillEl.innerHTML = arrowSVG(up) + ' ' + Math.abs(stocks[i].chg).toFixed(2) + '%';
      // tiny flash
      priceEl.style.color = up ? '#16a34a' : '#dc2626';
      setTimeout(() => priceEl.style.color = '', 600);
    });
  }, 4200);

  // Market filter chips
  const marketChips = $$('#markets .chip');
  marketChips.forEach(c => {
    c.addEventListener('click', () => {
      marketChips.forEach(x => x.classList.remove('active'));
      c.classList.add('active');
      const f = c.dataset.filter;
      $$('#stockGrid .stock').forEach(card => {
        const show = f === 'all' || card.dataset.cat === f || (f === 'up' && card.dataset.cat === 'up');
        card.style.display = show ? '' : 'none';
      });
    });
  });

  /* ─── Indices live drift ─────────────────── */
  const indices = [
    { id: '#ix-nifty',  v: 22530.70 },
    { id: '#ix-sensex', v: 74119.39 },
    { id: '#ix-bank',   v: 48650.15 },
    { id: '#ix-vix',    v: 13.28    },
  ];
  setInterval(() => {
    indices.forEach(ix => {
      const d = (Math.random() - .5) * .1;
      ix.v = +(ix.v * (1 + d / 100)).toFixed(2);
      const el = $(ix.id);
      if (el) el.textContent = ix.v.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2});
    });
  }, 3800);

  /* ─── Unlisted Cards ─────────────────────── */
  const unlisted = [
    { domain:'oyorooms.com',          name:'Oyo Hotels',       sector:'Hospitality',   brand:'#EE2E24', initial:'O', price:54,   iv:'+12.5%', tag:'trend' },
    { domain:'nseindia.com',          name:'NSE India',        sector:'Exchange',      brand:'#F58220', initial:'N', price:3850, iv:'+8.2%',  tag:'trend' },
    { domain:'pharmeasy.in',          name:'Pharmeasy',        sector:'Healthtech',    brand:'#10847E', initial:'P', price:8.5,  iv:'-3.4%',  tag:'avail' },
    { domain:'chennaisuperkings.com', name:'CSK',              sector:'Sports',        brand:'#FFCD00', initial:'C', price:204,  iv:'+18.6%', tag:'trend' },
    { domain:'boat-lifestyle.com',    name:'BOAT',             sector:'Consumer Tech', brand:'#111111', initial:'b', price:1450, iv:'+5.2%',  tag:'avail' },
    { domain:'tatacapital.com',       name:'Tata Capital',     sector:'NBFC',          brand:'#486AAB', initial:'T', price:920,  iv:'+9.8%',  tag:'lim'   },
    { domain:'hdbfs.com',             name:'HDB Financial',    sector:'NBFC',          brand:'#004C8F', initial:'H', price:1180, iv:'+11.2%', tag:'avail' },
    { domain:'swiggy.com',            name:'Swiggy',           sector:'Foodtech',      brand:'#FC8019', initial:'S', price:430,  iv:'+22.1%', tag:'lim'   },
    { domain:'relianceretail.com',    name:'Reliance Retail',  sector:'Retail',        brand:'#0E3F76', initial:'R', price:1380, iv:'+15.0%', tag:'trend' },
  ];

  const logoMarkup = (u) =>
    `<div class="unl-logo">
       <img src="https://logo.clearbit.com/${u.domain}" alt="${u.name} logo" loading="lazy"
            onerror="this.style.display='none';this.nextElementSibling.style.display='flex';"/>
       <span class="unl-logo-fallback" style="background:${u.brand}">${u.initial}</span>
     </div>`;

  const uGrid = $('#unlistedGrid');
  unlisted.forEach((u, i) => {
    const card = document.createElement('article');
    card.className = 'unl-card reveal';
    card.dataset.cat = u.tag;
    card.innerHTML = `
      <span class="unl-tag ${u.tag}">${u.tag === 'trend' ? 'Trending' : u.tag === 'avail' ? 'Available' : 'Limited'}</span>
      ${logoMarkup(u)}
      <h4>${u.name}</h4>
      <div class="sector">${u.sector}</div>
      <div class="unl-stats">
        <div class="unl-stat"><span>Price / Share</span><strong>₹${u.price.toLocaleString('en-IN')}</strong></div>
        <div class="unl-stat"><span>IV (1Y)</span><strong class="up">${u.iv}</strong></div>
      </div>`;
    uGrid.appendChild(card);
    io.observe(card);
  });

  // Unlisted filter
  const unlChips = $$('#unlisted .chip');
  unlChips.forEach(c => {
    c.addEventListener('click', () => {
      unlChips.forEach(x => x.classList.remove('active'));
      c.classList.add('active');
      const f = c.dataset.filter;
      const map = { all: null, trend: 'trend', avail: 'avail', lim: 'lim' };
      $$('#unlistedGrid .unl-card').forEach(card => {
        card.style.display = (map[f] === null || card.dataset.cat === map[f]) ? '' : 'none';
      });
    });
  });

  /* ─── SIP Calculator ─────────────────────── */
  const sipAmt = $('#sipAmt'), sipRate = $('#sipRate'), sipYr = $('#sipYr');
  const lblAmt = $('#sipAmtLabel'), lblRate = $('#sipRateLabel'), lblYr = $('#sipYrLabel');
  const oInv = $('#sipInvested'), oRet = $('#sipReturns'), oTot = $('#sipTotal');
  const dInv = $('#donutInvest'),  dGain = $('#donutGain'), dTot = $('#donutTotal');
  const C = 2 * Math.PI * 92; // donut circumference

  const setSliderFill = (el) => {
    const pct = ((+el.value - +el.min) / (+el.max - +el.min)) * 100;
    el.style.setProperty('--p', pct + '%');
  };

  const calcSIP = () => {
    [sipAmt, sipRate, sipYr].forEach(setSliderFill);
    const P = +sipAmt.value;
    const r = +sipRate.value / 100 / 12;
    const n = +sipYr.value * 12;
    const FV = r === 0 ? P * n : P * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
    const invested = P * n;
    const gains = FV - invested;

    lblAmt.textContent  = fmtINR(P);
    lblRate.textContent = (+sipRate.value).toFixed(1) + '%';
    lblYr.textContent   = sipYr.value + (sipYr.value === '1' ? ' Year' : ' Years');

    animateText(oInv, +oInv.dataset.last || invested, invested, fmtINR);
    animateText(oRet, +oRet.dataset.last || gains,    gains,    fmtINR);
    animateText(oTot, +oTot.dataset.last || FV,       FV,       fmtINR);
    animateText(dTot, +dTot.dataset.last || FV,       FV,       fmtINR, true);
    oInv.dataset.last = invested; oRet.dataset.last = gains; oTot.dataset.last = FV; dTot.dataset.last = FV;

    const pInv = invested / FV; const pGain = gains / FV;
    dInv.setAttribute('stroke-dasharray',  `${(pInv * C).toFixed(2)} ${C}`);
    dGain.setAttribute('stroke-dasharray', `${(pGain * C).toFixed(2)} ${C}`);
    dGain.setAttribute('stroke-dashoffset', `${(-pInv * C).toFixed(2)}`);
  };

  function animateText(el, from, to, fmt, isSvg) {
    const dur = 500; const start = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      const v = from + (to - from) * eased;
      const text = fmt(v);
      if (isSvg) el.textContent = text; else el.textContent = text;
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  [sipAmt, sipRate, sipYr].forEach(el => el.addEventListener('input', calcSIP));
  calcSIP();

  /* ─── Hero card sparkline ────────────────── */
  (() => {
    const vals = []; let v = 60;
    for (let i = 0; i < 30; i++) { v += (Math.random() - .35) * 6; vals.push(v); }
    const min = Math.min(...vals), max = Math.max(...vals), r = max - min;
    const w = 320, h = 110;
    const path = vals.map((y, i) => {
      const x = (i / (vals.length - 1)) * w;
      const yy = h - ((y - min) / r) * h;
      return (i === 0 ? 'M' : 'L') + x.toFixed(1) + ',' + yy.toFixed(1);
    }).join(' ');
    $('#heroLine').setAttribute('d', path);
    $('#heroArea').setAttribute('d', `${path} L${w},${h} L0,${h} Z`);
  })();

  /* ─── Dashboard performance chart ────────── */
  (() => {
    const vals = []; let v = 100;
    for (let i = 0; i < 50; i++) { v += (Math.random() - .35) * 6; vals.push(v); }
    const min = Math.min(...vals), max = Math.max(...vals), r = max - min;
    const w = 600, h = 200;
    const path = vals.map((y, i) => {
      const x = (i / (vals.length - 1)) * w;
      const yy = h - ((y - min) / r) * (h - 20) - 10;
      return (i === 0 ? 'M' : 'L') + x.toFixed(1) + ',' + yy.toFixed(1);
    }).join(' ');
    $('#dLine').setAttribute('d', path);
    $('#dArea').setAttribute('d', `${path} L${w},${h} L0,${h} Z`);
  })();

  /* ─── Allocation bars trigger ─────────────── */
  const allocList = $('.alloc-list');
  if (allocList) {
    new IntersectionObserver((entries) => {
      entries.forEach(en => { if (en.isIntersecting) en.target.classList.add('in'); });
    }, { threshold: .25 }).observe(allocList);
  }

  /* ─── Form submit ─────────────────────────── */
  $('#onboardForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('.form-submit');
    btn.textContent = 'Submitting…';
    btn.style.opacity = .7;
    setTimeout(() => {
      $('#formSuccess').classList.add('show');
      btn.textContent = 'Submitted ✓';
      btn.style.opacity = 1;
      setTimeout(() => {
        e.target.reset();
        btn.textContent = 'Submit & Get Started';
        $('#formSuccess').classList.remove('show');
      }, 4000);
    }, 900);
  });

  /* ─── Mobile menu (full-screen overlay) ────── */
  (() => {
    const toggle = $('#mobileToggle');
    const links = $('.nav-links');
    if (!toggle || !links) return;

    let closeBtn = null;

    const open = () => {
      // Reset any old inline styles from previous approach
      links.removeAttribute('style');
      links.classList.add('mobile-open');
      document.body.style.overflow = 'hidden';

      // Add close button
      closeBtn = document.createElement('button');
      closeBtn.className = 'mobile-close-btn';
      closeBtn.setAttribute('aria-label', 'Close menu');
      closeBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18"/></svg>';
      document.body.appendChild(closeBtn);
      closeBtn.addEventListener('click', close);
    };

    const close = () => {
      links.classList.remove('mobile-open');
      links.removeAttribute('style');
      document.body.style.overflow = '';
      closeBtn?.remove();
      closeBtn = null;
    };

    toggle.addEventListener('click', () => {
      if (links.classList.contains('mobile-open')) close();
      else open();
    });

    // Close on link click
    links.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
  })();

  /* ─── Side-rail section navigator ─────────── */
  (() => {
    const rail = $('#sideRail');
    if (!rail) return;
    const links = $$('a', rail);
    const hero = $('#hero');
    const showThreshold = () => (hero?.offsetHeight || innerHeight) * 0.7;

    addEventListener('scroll', () => {
      rail.classList.toggle('show', scrollY > showThreshold());
    }, { passive: true });

    const railIO = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          const id = en.target.id;
          links.forEach(a => a.classList.toggle('active', a.dataset.rail === id));
        }
      });
    }, { threshold: 0, rootMargin: '-45% 0px -45% 0px' });

    links.forEach(a => {
      const sec = document.getElementById(a.dataset.rail);
      if (sec) railIO.observe(sec);
    });
  })();

  /* ─── Onboard step progress fill ──────────── */
  (() => {
    const list = $('.steps');
    if (!list) return;
    const update = () => {
      const r = list.getBoundingClientRect();
      const total = r.height;
      const anchor = innerHeight * 0.55;
      const seen = Math.max(0, Math.min(total, anchor - r.top));
      const pct = total ? (seen / total) * 100 : 0;
      list.style.setProperty('--step-progress', pct.toFixed(1) + '%');
    };
    addEventListener('scroll', update, { passive: true });
    addEventListener('resize', update);
    update();
  })();

  /* ─── FAQ accordion (single-open) ─────────── */
  $$('.faq-q').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const isOpen = item.classList.contains('open');
      $$('.faq-item.open').forEach(o => {
        o.classList.remove('open');
        o.querySelector('.faq-q')?.setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* ─── Live activity toasts ────────────────── */
  (() => {
    const stack = $('#toastStack');
    if (!stack) return;

    const activities = [
      { name:'Aarav S.',  city:'Bengaluru', action:'Started SIP',           detail:'₹15,000/mo',  time:'2 min',  color:'#0E3F76' },
      { name:'Priya K.',  city:'Mumbai',    action:'Bought Reliance Ind.',  detail:'₹2,840',      time:'5 min',  color:'#7c3aed' },
      { name:'Vikram I.', city:'Delhi',     action:'Allocated to Tata Cap', detail:'Unlisted',    time:'8 min',  color:'#01696f' },
      { name:'Neha R.',   city:'Hyderabad', action:'PMS investment',        detail:'₹50,00,000',  time:'12 min', color:'#ea7c1c' },
      { name:'Karan M.',  city:'Pune',      action:'Bought Govt. Bond',     detail:'₹1,00,000',   time:'15 min', color:'#16a34a' },
      { name:'Rahul B.',  city:'Chennai',   action:'Increased SIP',         detail:'₹25,000/mo',  time:'18 min', color:'#dc2626' },
      { name:'Anjali T.', city:'Kolkata',   action:'New ELSS investment',   detail:'₹1,50,000',   time:'21 min', color:'#2563eb' },
      { name:'Suresh G.', city:'Ahmedabad', action:'Bought Sovereign Gold', detail:'₹50,000',     time:'24 min', color:'#01696f' },
    ];

    let idx = 0;
    const showToast = () => {
      const a = activities[idx % activities.length]; idx++;
      while (stack.children.length >= 3) stack.firstElementChild?.remove();
      const toast = document.createElement('div');
      toast.className = 'toast';
      const initial = a.name.charAt(0);
      toast.innerHTML = `
        <span class="toast-avatar" style="background:${a.color}">${initial}</span>
        <div class="toast-body">
          <b>${a.name} from ${a.city}</b>
          <i>${a.action} · ${a.detail}</i>
        </div>
        <span class="toast-time">${a.time} ago</span>`;
      stack.appendChild(toast);
      requestAnimationFrame(() => toast.classList.add('in'));
      setTimeout(() => {
        toast.classList.remove('in');
        toast.classList.add('out');
        setTimeout(() => toast.remove(), 500);
      }, 5500);
    };

    setTimeout(() => {
      showToast();
      setInterval(showToast, 8500);
    }, 6000);
  })();

  /* ─── Top scroll progress bar ─────────────── */
  (() => {
    const bar = $('#scrollProgress');
    if (!bar) return;
    const update = () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      const pct = max > 0 ? (scrollY / max) * 100 : 0;
      bar.style.width = pct.toFixed(2) + '%';
    };
    addEventListener('scroll', update, { passive: true });
    addEventListener('resize', update);
    update();
  })();

  /* ─── Back-to-top button ──────────────────── */
  (() => {
    const btn = $('#backTop');
    if (!btn) return;
    addEventListener('scroll', () => {
      btn.classList.toggle('show', scrollY > innerHeight * 0.8);
    }, { passive: true });
    btn.addEventListener('click', () => {
      scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  })();

  /* ─── Newsletter signup ───────────────────── */
  $('#newsletterForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = e.target.querySelector('input');
    const btn = e.target.querySelector('button');
    const span = btn.querySelector('span');
    const msg = $('#fnMsg');
    if (!input?.value || !input.checkValidity()) { input?.focus(); return; }
    const original = span.textContent;
    span.textContent = 'Subscribing…';
    btn.style.opacity = .7;
    setTimeout(() => {
      msg.classList.add('show');
      span.textContent = 'Subscribed ✓';
      btn.style.opacity = 1;
      input.value = '';
      setTimeout(() => {
        msg.classList.remove('show');
        span.textContent = original;
      }, 4000);
    }, 700);
  });

  /* ─── Cookie consent banner ───────────────── */
  (() => {
    const banner = $('#cookieBanner');
    if (!banner) return;
    let stored = null;
    try { stored = localStorage.getItem('peculiex-cookie-consent'); } catch (e) {}
    if (stored) return; // user already chose

    // Show after preloader has had time to dismiss
    setTimeout(() => banner.classList.add('show'), 1800);

    const dismiss = (choice) => {
      try { localStorage.setItem('peculiex-cookie-consent', choice); } catch (e) {}
      banner.classList.remove('show');
      banner.classList.add('gone');
      setTimeout(() => banner.remove(), 550);
    };

    $('#cookieAccept')?.addEventListener('click', () => dismiss('accepted'));
    $('#cookieDecline')?.addEventListener('click', () => dismiss('essential-only'));
  })();
});
