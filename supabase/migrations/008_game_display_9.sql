-- Add 9th kiosk: editable landing page / intro panel for the /store page.
-- Positioned center-bottom walkway between the two existing bottom kiosks.

insert into game_displays (id, label, title, content, color, glow, pos_x, pos_y, sort_order)
values (
  8,
  'ABOUT',
  '🏪  ABOUT THIS STORE',
  '<span class="sec">▸ WHAT IS THIS?</span>
This is an interactive introduction to Jake Ricciardi — built as a grocery store because
Jake is starting a new role building interactive display advertising inside actual grocery stores.
It seemed like the right format. Full circle and all that.
<span class="sec">▸ HOW TO NAVIGATE</span>
Use <span class="hi">ARROW KEYS or WASD</span> to walk around the store. When you see a glowing
display kiosk, walk up to it and press <span class="hi">SPACE or E</span> to open it.
There are 9 displays total — each one covers a different slice of who Jake is
and how he works. Should take about 5 minutes end to end.
<span class="sec">▸ WANT TO CONNECT?</span>
Reach out at <span class="hi">jakericciardi@gmail.com</span> or find him at
<span class="hi">jake.foxricciardi.com</span>.<br>
He responds to short, direct messages. Not emails. (See the BAKERY display for context.)',
  '#FF44CC',
  '#FF88EE',
  362,
  460,
  8
);
