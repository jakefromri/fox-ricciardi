-- ── game_displays ─────────────────────────────────────────────────────────────
-- Stores the 8 interactive kiosk display configs for the /store page game.
-- Content (label, title, HTML body) is editable via /admin/store without a
-- code deploy. Kiosk position and color are also stored here so the layout
-- can be adjusted without touching the component.

create table if not exists game_displays (
  id          int         primary key,
  label       text        not null,  -- short name on kiosk face e.g. "PRODUCE"
  title       text        not null,  -- panel header shown when opened
  content     text        not null,  -- HTML body of the info panel
  color       text        not null,  -- hex color for the kiosk body
  glow        text        not null,  -- hex color for the glow/shadow effect
  pos_x       int         not null,  -- canvas x position (pixels)
  pos_y       int         not null,  -- canvas y position (pixels)
  sort_order  int         not null default 0,
  updated_at  timestamptz not null default now()
);

alter table game_displays enable row level security;

-- Anyone can read (game loads displays publicly)
create policy "public_select_game_displays"
  on game_displays for select
  using (true);

-- Only authenticated admins can update
create policy "admin_update_game_displays"
  on game_displays for update
  using (auth.role() = 'authenticated');

-- ── seed data ─────────────────────────────────────────────────────────────────

insert into game_displays (id, label, title, content, color, glow, pos_x, pos_y, sort_order) values

(0, 'WELCOME', '★  WELCOME TO JAKE''S STORE  ★',
'<span class="sec">▸ HEY, I''M JAKE</span>
Jake Ricciardi — Product Manager, Kingston, Rhode Island. Dad of two. Home-office devotee.
Joining a new chapter building interactive display advertising inside grocery stores — which is
exactly the kind of full-circle moment I couldn''t have scripted.
<span class="sec">▸ HOW THIS WORKS</span>
Find all <span class="hi">8 displays</span> scattered around the store. Each one covers a different slice of
who I am and how I work. Walk up to a glowing kiosk, press <span class="hi">SPACE</span> to interact.
Should take about 5 minutes. I''m told I''m worth it.
<span class="sec">▸ QUICK VITALS</span>
📍 Kingston, RI &nbsp;|&nbsp; 👨‍👩‍👦‍👦 Dad of 2 &nbsp;|&nbsp; 🏡 Home office &nbsp;|&nbsp; 🌱 Gardener<br>
15+ years in product — legal tech → talent marketplace → fitness SaaS → <span class="hi">this</span>.',
'#FFD700', '#FFAA00', 356, 60, 0),

(1, 'PRODUCE', '🥬  FRESH PICKS: CAREER JOURNEY',
'<span class="sec">▸ 2009–2018 · AXIOM LEGAL  (~Employee #50)</span>
Joined at $50M, left at $350M. Built tech-enabled service businesses for major legal projects —
M&A, regulatory reform. Led product for an AI-based contract analysis business that hit
<span class="hi">~$30M revenue and sold to LexisNexis</span>. Backed by Benchmark and Carrick Capital.
<span class="sec">▸ 2019–2020 · NLYST  (Employee #1)</span>
Bootstrapped a two-sided marketplace from zero. Built tools to read resumes and give
application feedback. <span class="bad">Shut down during COVID.</span> Learned everything the hard way about
starting from scratch — and surprisingly don''t regret a minute of it.
<span class="sec">▸ 2021–2025 · ANDELA  (~Employee #150)</span>
Google Ventures + Chan Zuckerberg + SoftBank backed global talent marketplace. Built AI
for self-service customer hiring, LLM-based workflows, global payments infra. Grew from
$50M → $150M.
<span class="sec">▸ 2025 · PUSHPRESS  (~Employee #100)</span>
Fitness SaaS focused on growth, scale, repeatability of customer success.
Key insight: <span class="hi">AI is not a panacea</span> — real value is serving customers with the best
possible experience.
<span class="sec">▸ NOW · NEW ADVENTURE</span>
Interactive display advertising inside grocery stores. Building the thing
you''re literally navigating right now. 🛒 Full circle.',
'#22CC55', '#44FF77', 64, 80, 1),

(2, 'ELECTRONICS', '💻  HOW I DO MY BEST WORK',
'<span class="sec">▸ ENVIRONMENT</span>
Home office. I need a few <span class="hi">2+ hour uninterrupted blocks</span> each week for deep work —
reading, data analysis, writing, slide work. I love getting in-person time every couple
months to build culture and relationships. Remote-first, not remote-only.
<span class="sec">▸ HOURS</span>
Typically online <span class="hi">9am–7pm EST</span>. I protect 7–9am and 7–9pm for dad duties. Outside
those windows I''m usually reachable on mobile. Responsive is my default mode.
<span class="sec">▸ WHAT I NEED</span>
The big picture — mission, vision, strategy, goals. Data, evidence, a story that connects them.
Context before tactics. Don''t give me a to-do list without the why.
<span class="sec">▸ WHAT DERAILS ME</span>
When <span class="bad">everything is P0</span> — so inevitably nothing is. CYA culture and blame-shifting.
I thrive when accountability runs in both directions and priorities are real.',
'#2288FF', '#44AAFF', 660, 80, 2),

(3, 'BAKERY', '📡  BEST WAY TO REACH ME',
'<span class="sec">▸ TIER 1 — MOST EFFECTIVE</span>
<span class="hi">5–10 min live sync</span> (Slack huddle, Google Meet). Get in, get out, aligned.
Almost always better than a long written thread.
<span class="sec">▸ TIER 2 — WORKS GREAT</span>
<span class="hi">Chat (Slack / WhatsApp)</span> — great for a few turns of back-and-forth.
If it goes past 3–4 exchanges, let''s just huddle.
<span class="sec">▸ TIER 3 — USE FOR DOCS</span>
Live sync with a written follow-up note. Useful when decisions need to be documented.
<span class="sec">▸ TIER 4 — IF YOU WANT TO BE FORGOTTEN</span>
<span class="bad">Email.</span> I''m not proud of this. But you''ve been warned. 🙈
<span class="sec">▸ FEEDBACK STYLE</span>
Give it immediately and directly. My wife says my love language is
<span class="hi">words of affirmation</span> — so constructive directness is genuinely appreciated.',
'#FF6600', '#FF8833', 64, 300, 3),

(4, 'FROZEN', '🧊  MY VALUES',
'<span class="sec">▸ OWNERSHIP</span>
<span class="hi">"Everything goes right — you did it. Everything goes wrong — I did it."</span><br>
<span class="dim">I absorb the downside and celebrate your wins. That''s the deal I make with every team I join.</span>
<span class="sec">▸ DIRECT FEEDBACK</span>
<span class="hi">"If I have feedback for you, you will be the first to know."</span><br>
<span class="dim">In the moment, when possible. Not saved for quarterly reviews.</span>
<span class="sec">▸ LIFE FIRST</span>
<span class="hi">"Draw your own boundaries and let us know what they are."</span><br>
<span class="dim">I protect mornings and evenings for family. I''ll never judge you for protecting what matters.</span>
<br><br>
<span class="dim">Like most folks — I''m not perfect. I try to hold myself accountable to these,
and you''re encouraged to hold me to them too.</span>',
'#BB44FF', '#DD88FF', 660, 300, 4),

(5, 'DELI', '❤️  LOVES & HATES',
'<span class="sec">▸ THINGS THAT MAKE ME LIGHT UP</span>
🔍 Observing user behavior in the wild or in data<br>
📊 Beautiful data visualizations<br>
💡 Watching users have genuine aha! moments<br>
🎓 Teaching and coaching — probably my favorite mode<br>
🌱 Gardening (yes, really — actual dirt, actual vegetables)<br>
🪢 Jump rope (low-key favorite workout)
<span class="sec">▸ THINGS THAT DRAIN MY SOUL</span>
🚫 <span class="bad">Meetings to nowhere</span> — agenda-less, decision-less, endless<br>
🚫 <span class="bad">Lack of accountability</span> — "not my problem" culture<br>
🚫 <span class="bad">Buck-passing</span> — everyone''s responsible = no one''s responsible<br>
🚫 <span class="bad">Product pricing pages that don''t include prices</span><br>
<span class="dim">(That last one is very specific and very real.)</span>',
'#FF3366', '#FF6699', 362, 300, 5),

(6, 'CHECKOUT', '📚  WHAT INSPIRES ME',
'<span class="sec">▸ BOOKS I COME BACK TO</span>
<span class="hi">Hacking Growth</span> — Sean Ellis & Morgan Brown<br>
<span class="dim">How today''s fastest-growing companies drive breakout success through rapid experimentation.</span><br><br>
<span class="hi">Crossing the Chasm</span> — Geoffrey A. Moore<br>
<span class="dim">The definitive guide to marketing disruptive products to mainstream customers.</span><br><br>
<span class="hi">Product-Led Growth</span> — Wes Bush<br>
<span class="dim">How to build a product that sells itself. The PLG playbook.</span>
<span class="sec">▸ PRODUCT HEROES</span>
🐭 <span class="hi">Walt Disney</span> — Scrappy origins, infinite imagination. Built experiences that outlive every trend.<br><br>
🦉 <span class="hi">Duolingo</span> — Product-led growth in the wild. Gamified learning with tight feedback loops.',
'#DDBB00', '#FFDD22', 64, 460, 6),

(7, 'OFFICE', '🗺️  THE BIG PICTURE',
'<span class="sec">▸ THE THROUGH-LINE</span>
I''ve been part of companies scaling from nothing to hundreds of millions. I''ve been
employee #1 bootstrapping in a pandemic. Each stop taught me something the last one couldn''t.
<span class="sec">▸ HOW I THINK ABOUT PRODUCT</span>
Data and story together — neither works alone. User observation first, intuition second.
<span class="hi">Build fast enough to learn. Slow down enough to build right.</span>
<span class="sec">▸ WHAT I''M BRINGING HERE</span>
Builder instincts. Bias toward action. Real talk. A sense of when to go fast and
when to pump the brakes. And genuine excitement about interactive grocery store
displays — turns out that''s a <span class="hi">very</span> fun thing to build for.
<span class="sec">▸ THE FOUNDATION</span>
Two kids, a house in Rhode Island, a garden that sometimes produces actual vegetables.
That''s not a non-sequitur — it''s what everything else runs on. 🌿<br>
<span class="dim">Glad you made it to the end. Come say hi.</span>',
'#00CCAA', '#00FFCC', 660, 460, 7);
