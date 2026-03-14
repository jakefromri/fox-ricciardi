#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# Publishes the 4-part "Building with AI" blog series to jake.foxricciardi.com
# Run from your terminal: bash publish_blog_series.sh
# ─────────────────────────────────────────────────────────────────────────────

API_URL="https://jake.foxricciardi.com/api/posts"
API_KEY="sk_03d60752b8eb6121fd344ec747544092b2a7da24a8c2482ed3e9047c13580398"

publish() {
  local part="$1"
  local payload="$2"
  echo ""
  echo "📤 Publishing $part..."
  response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL" \
    -H "Authorization: Bearer $API_KEY" \
    -H "Content-Type: application/json" \
    -d "$payload")
  http_code=$(echo "$response" | tail -1)
  body=$(echo "$response" | head -n -1)
  if [ "$http_code" = "201" ]; then
    id=$(echo "$body" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['post']['id'])" 2>/dev/null)
    slug=$(echo "$body" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['post']['slug'])" 2>/dev/null)
    echo "  ✅ Published — ID: $id | slug: $slug"
  else
    echo "  ❌ HTTP $http_code: $body"
  fi
}

# ─────────────────────────────────────────────────────────────────────────────
# Part 1
# ─────────────────────────────────────────────────────────────────────────────
publish "Part 1: Set Up Like You Mean It" '{
  "title": "Set Up Like You Mean It",
  "slug": "building-with-ai-part-1-setup",
  "excerpt": "Most people jump straight into building. That\u2019s usually the first mistake. Before we wrote a single line of code for this blog, we spent time on structure \u2014 and it paid off immediately.",
  "status": "published",
  "content": {
    "type": "doc",
    "content": [
      {"type":"paragraph","content":[{"type":"text","text":"Most people jump straight into building. That\u2019s usually the first mistake."}]},
      {"type":"paragraph","content":[{"type":"text","text":"Before we wrote a single line of code for this blog, we spent time thinking about structure \u2014 how files would be organized, what each \u201cagent\u201d would be responsible for, and how everything would connect. That upfront investment paid off immediately."}]},
      {"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"What\u2019s a \u2018folder structure\u2019 and why does it matter?"}]},
      {"type":"paragraph","content":[{"type":"text","text":"Think of it like a filing cabinet. If you dump everything in one drawer, you\u2019ll spend half your time searching for things. A clean folder structure means every file has an obvious home \u2014 and when you come back to a project after two weeks, you don\u2019t have to reconstruct it from scratch."}]},
      {"type":"paragraph","content":[{"type":"text","text":"For this project, we created a /personal/fox-ricciardi/ folder. Inside: source code, config files, change logs, and docs \u2014 each in its own place. When we needed to update something, we knew exactly where to look."}]},
      {"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Agents: Think of them as specialized contractors"}]},
      {"type":"paragraph","content":[{"type":"text","text":"We use a system called the Ralph Loop \u2014 a series of seven AI agents, each with a specific job. One agent scopes the work. Another designs the architecture. A third stress-tests the design. Then you have a builder, a QA tester, a deploy agent, and one that captures learnings after each build."}]},
      {"type":"paragraph","content":[{"type":"text","text":"Why not just have one AI do everything? The same reason you don\u2019t want your architect also installing your plumbing. Specialization produces better output. Each agent has explicit inputs and outputs, so nothing falls through the cracks."}]},
      {"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"What this looks like in practice"}]},
      {"type":"paragraph","content":[{"type":"text","text":"Before building this blog, we ran through the first three agents: scope, architecture, adversarial review. The scope agent helped define exactly what we were building and what we weren\u2019t. The architecture agent laid out the technical blueprint. The adversarial agent asked hard questions \u2014 what happens if this breaks? What are we missing?"}]},
      {"type":"paragraph","content":[{"type":"text","text":"Only after that did we hand it to the builder. The whole process took a few hours of back-and-forth conversation with Claude. No code written yet. Just clarity."}]},
      {"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"The non-technical takeaway"}]},
      {"type":"paragraph","content":[{"type":"text","text":"You don\u2019t need to understand code to make good architectural decisions. You need to ask good questions. What problem am I solving? What\u2019s in scope? What could go wrong? The agents help structure that thinking \u2014 and force you to answer before you build."}]},
      {"type":"paragraph","content":[{"type":"text","text":"Start organized. You\u2019ll move faster, not slower."}]},
      {"type":"paragraph","content":[{"type":"text","text":"This is Part 1 of a 4-part series on how I built this blog as a non-technical PM using Claude. Next up: version control without the fear."}]}
    ]
  }
}'

# ─────────────────────────────────────────────────────────────────────────────
# Part 2
# ─────────────────────────────────────────────────────────────────────────────
publish "Part 2: Git Without the Fear" '{
  "title": "Git Without the Fear",
  "slug": "building-with-ai-part-2-git",
  "excerpt": "If you\u2019ve ever heard a developer mention \u2018pushing to main\u2019 and nodded along with no idea what they meant \u2014 this post is for you. Version control sounds more complicated than it is.",
  "status": "published",
  "content": {
    "type": "doc",
    "content": [
      {"type":"paragraph","content":[{"type":"text","text":"If you\u2019ve ever heard a developer mention \u201cpushing to main\u201d and nodded along while having no idea what they meant \u2014 this post is for you."}]},
      {"type":"paragraph","content":[{"type":"text","text":"Version control is one of those things that sounds more complicated than it is. Here\u2019s what you actually need to know."}]},
      {"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"What Git is (and isn\u2019t)"}]},
      {"type":"paragraph","content":[{"type":"text","text":"Git is a system that tracks changes to your code over time. Think of it like Google Docs\u2019 version history, but for an entire project. You can see every change ever made, who made it, and why. You can roll back to any previous version if something breaks."}]},
      {"type":"paragraph","content":[{"type":"text","text":"GitHub is where that history lives online \u2014 a public or private home for your project\u2019s code."}]},
      {"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Why we made our repo public"}]},
      {"type":"paragraph","content":[{"type":"text","text":"We chose to make the fox-ricciardi.com repository public. A few reasons: public repos get access to GitHub\u2019s branch protection features without needing a paid plan, and there\u2019s nothing sensitive in the code itself. API keys, passwords, and credentials live in environment variables \u2014 never in the code."}]},
      {"type":"paragraph","content":[{"type":"text","text":"If you\u2019re building something with proprietary business logic, private is the right call. For a personal blog or portfolio, public is fine."}]},
      {"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"The three-branch strategy"}]},
      {"type":"paragraph","content":[{"type":"text","text":"We use three environments: local, dev, and production. Each has a corresponding branch in Git. Feature branches are where new work happens \u2014 you create one, build something, and test it there. The dev branch is staging: everything gets tested here before going live. The main branch is production. Only clean, tested code lands here."}]},
      {"type":"paragraph","content":[{"type":"text","text":"The rule: never push directly to main. Always go through dev first. It sounds like extra work. It saves you from breaking a live site at the worst possible moment."}]},
      {"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Branch protection in plain English"}]},
      {"type":"paragraph","content":[{"type":"text","text":"We set up \u201cbranch protection\u201d on main \u2014 a rule that says no one (including yourself) can merge code without going through a pull request. A pull request is basically: \u201cHere\u2019s what I built. Review it before it goes live.\u201d"}]},
      {"type":"paragraph","content":[{"type":"text","text":"Even as a solo developer, this discipline is worth it. It creates a checkpoint. A moment to ask: did I actually test this?"}]},
      {"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"The non-technical takeaway"}]},
      {"type":"paragraph","content":[{"type":"text","text":"You don\u2019t need to use the command line to understand this mental model. The key concepts are: track your changes, test before publishing, and protect your production environment. These aren\u2019t developer habits \u2014 they\u2019re good project management habits."}]},
      {"type":"paragraph","content":[{"type":"text","text":"The tools just make them automatic."}]},
      {"type":"paragraph","content":[{"type":"text","text":"Part 2 of 4. Next: how we chose our tech stack \u2014 and why those decisions matter more than you\u2019d think."}]}
    ]
  }
}'

# ─────────────────────────────────────────────────────────────────────────────
# Part 3
# ─────────────────────────────────────────────────────────────────────────────
publish "Part 3: Choosing a Tech Stack" '{
  "title": "Choosing a Tech Stack (When You\u2019re Not a Developer)",
  "slug": "building-with-ai-part-3-stack",
  "excerpt": "When we sat down to build this blog, we had to make decisions most PMs never face: what technology to build with. Here\u2019s how we thought about it \u2014 and why it might matter to you.",
  "status": "published",
  "content": {
    "type": "doc",
    "content": [
      {"type":"paragraph","content":[{"type":"text","text":"When we sat down to build this blog, we had to make a set of decisions that most product managers never have to make: what technology to build it with. Here\u2019s how we thought about it \u2014 and why it might matter to you."}]},
      {"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"The front end: React + TypeScript + shadcn/ui"}]},
      {"type":"paragraph","content":[{"type":"text","text":"The front end is what you see \u2014 the website itself. We chose React, a popular JavaScript framework, because it\u2019s well-documented, widely used, and Claude handles it exceptionally well."}]},
      {"type":"paragraph","content":[{"type":"text","text":"We added TypeScript, which is like React with stricter rules. It catches errors before they happen. For a solo builder with no QA team, that\u2019s valuable."}]},
      {"type":"paragraph","content":[{"type":"text","text":"For design, we used shadcn/ui \u2014 a library of pre-built, polished UI components. Buttons, forms, cards, tables \u2014 all professionally designed and ready to drop in. The alternative is building everything from scratch. That path leads to interfaces that look like they were built in 2009. We skipped it."}]},
      {"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"The database and authentication: Supabase"}]},
      {"type":"paragraph","content":[{"type":"text","text":"Supabase is a hosted database service that also handles user login. We use it for two things: storing blog posts, and authenticating the admin who manages them."}]},
      {"type":"paragraph","content":[{"type":"text","text":"The key word is \u201chosted\u201d \u2014 we didn\u2019t install anything. We created an account, set up a project, and got a database that lives in the cloud. Supabase has a dashboard (web interface) for visual management and a CLI (command line interface) for making changes programmatically."}]},
      {"type":"paragraph","content":[{"type":"text","text":"We learned quickly: use the CLI for anything structural. The dashboard is great for browsing data, but running database migrations through the CLI keeps changes tracked and repeatable."}]},
      {"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Hosting: Vercel"}]},
      {"type":"paragraph","content":[{"type":"text","text":"Vercel is where the website lives. When we push code to GitHub, Vercel automatically builds and deploys it. Zero manual steps. The dev branch deploys to a staging URL. The main branch deploys to production. Vercel also handles our blog API \u2014 small pieces of backend code that run on demand without needing a full server."}]},
      {"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"The custom domain: GoDaddy \u2192 Vercel"}]},
      {"type":"paragraph","content":[{"type":"text","text":"Buying a domain on GoDaddy and connecting it to Vercel requires a bit of DNS configuration \u2014 essentially telling the internet \u201cwhen someone types jake.foxricciardi.com, send them here.\u201d It involves updating a CNAME record in GoDaddy\u2019s dashboard, verifying it in Vercel, and waiting for DNS to propagate (usually under an hour)."}]},
      {"type":"paragraph","content":[{"type":"text","text":"We documented this as a reusable template so we never have to figure it out again."}]},
      {"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"The non-technical takeaway"}]},
      {"type":"paragraph","content":[{"type":"text","text":"The stack decisions we made optimize for three things: speed (pre-built components), safety (hosted services, no servers to manage), and repeatability (documented templates). Every decision was made with the assumption that Claude would be doing most of the building \u2014 so we chose tools Claude handles well."}]},
      {"type":"paragraph","content":[{"type":"text","text":"Part 3 of 4. Next: how we publish posts directly from Claude without logging into any dashboard."}]}
    ]
  }
}'

# ─────────────────────────────────────────────────────────────────────────────
# Part 4
# ─────────────────────────────────────────────────────────────────────────────
publish "Part 4: Publishing Without a CMS" '{
  "title": "Publishing Without a CMS",
  "slug": "building-with-ai-part-4-publishing",
  "excerpt": "This is my favorite part of how this blog works: I don\u2019t log in to publish anything. Here\u2019s how an API-first publishing workflow makes Claude the only interface you need.",
  "status": "published",
  "content": {
    "type": "doc",
    "content": [
      {"type":"paragraph","content":[{"type":"text","text":"This is my favorite part of how this blog works: I don\u2019t log in to publish anything."}]},
      {"type":"paragraph","content":[{"type":"text","text":"Most blogs run on a CMS \u2014 content management system. WordPress, Ghost, Squarespace. You log in, click around, write your post, hit publish. It works. But it also means your blog is dependent on someone else\u2019s platform, their pricing, their interface."}]},
      {"type":"paragraph","content":[{"type":"text","text":"We built something different: an API-first publishing workflow where Claude Cowork is the interface."}]},
      {"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"What\u2019s an API?"}]},
      {"type":"paragraph","content":[{"type":"text","text":"An API is a way for software to talk to software. When you post to Instagram, your phone talks to Instagram\u2019s servers through an API. When a weather app shows you the forecast, it\u2019s pulling data through a weather API."}]},
      {"type":"paragraph","content":[{"type":"text","text":"We built a simple API for this blog. It accepts blog posts \u2014 title, slug, content, status \u2014 and saves them to the database. That\u2019s it."}]},
      {"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"API keys: the front door"}]},
      {"type":"paragraph","content":[{"type":"text","text":"To use the API, you need an API key. Think of it like a password that you give to a specific application \u2014 in this case, Claude \u2014 so it can act on your behalf. The key is stored securely in the database (as a hash, not plain text), and you can revoke it anytime."}]},
      {"type":"paragraph","content":[{"type":"text","text":"I generated a key through the admin dashboard, gave it to Claude, and now Claude can create and manage posts directly."}]},
      {"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"The publishing workflow"}]},
      {"type":"paragraph","content":[{"type":"text","text":"Here\u2019s what creating this post actually looked like: I described the blog series I wanted to write in a conversation with Claude. Claude drafted all four posts. Claude called the API with the content, title, slug, and \u2018published\u2019 status. The posts appeared on the blog."}]},
      {"type":"paragraph","content":[{"type":"text","text":"No CMS login. No copy-paste. No formatting issues. Just a conversation."}]},
      {"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Why build this instead of using a CMS?"}]},
      {"type":"paragraph","content":[{"type":"text","text":"A few reasons. First, I own it \u2014 no platform risk. Second, it integrates naturally with how I work with Claude. Third, it was a great learning exercise for understanding how APIs actually work in practice."}]},
      {"type":"paragraph","content":[{"type":"text","text":"The tradeoff is real: there\u2019s no visual editor, no media library, no drag-and-drop. For a personal blog maintained through Claude, that\u2019s an acceptable tradeoff. For a team content operation, a real CMS is probably the right call."}]},
      {"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"The bigger picture"}]},
      {"type":"paragraph","content":[{"type":"text","text":"What we built over these three days isn\u2019t just a blog. It\u2019s a template for how to approach any software project as a non-technical PM: define structure first, use proven tools, document decisions as you go, and automate the repetitive parts."}]},
      {"type":"paragraph","content":[{"type":"text","text":"The blog itself is almost incidental. The process is what\u2019s reusable."}]},
      {"type":"paragraph","content":[{"type":"text","text":"That\u2019s a wrap on the series. Next up: a deeper dive into the Ralph Loop \u2014 the seven-agent framework I use for building applications."}]}
    ]
  }
}'

echo ""
echo "Done!"
