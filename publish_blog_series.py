#!/usr/bin/env python3
"""
Publishes the 4-part "Building with AI" blog series to jake.foxricciardi.com
Run from your terminal: python3 publish_blog_series.py
"""
import json, urllib.request, urllib.error

API_URL = "https://jake.foxricciardi.com/api/posts"
API_KEY = "sk_03d60752b8eb6121fd344ec747544092b2a7da24a8c2482ed3e9047c13580398"

def p(text):
    return {"type": "paragraph", "content": [{"type": "text", "text": text}]}

def h2(text):
    return {"type": "heading", "attrs": {"level": 2}, "content": [{"type": "text", "text": text}]}

def em(text):
    return {"type": "paragraph", "content": [{"type": "text", "marks": [{"type": "italic"}], "text": text}]}

def doc(*nodes):
    return {"type": "doc", "content": list(nodes)}

# ─────────────────────────────────────────────────────────────────────────────
# Part 1
# ─────────────────────────────────────────────────────────────────────────────
post1 = {
    "title": "set up like you mean it",
    "slug": "building-with-ai-part-1-setup",
    "excerpt": "most people jump straight into building... that's usually the first mistake. before we wrote a single line of code for this blog, we spent time on structure — and it paid off immediately.",
    "status": "published",
    "content": doc(
        p("most people jump straight into building... that's usually the first mistake."),
        p("before we wrote a single line of code for this blog, we spent time thinking about structure — how files would be organized, what each \"agent\" would be responsible for, and how everything connects. that upfront investment paid off immediately."),
        h2("what's a 'folder structure' and why does it matter?"),
        p("think of it like a filing cabinet... if you dump everything in one drawer, you'll spend half your time searching for things. a clean folder structure means every file has an obvious home — and when you come back to a project after two weeks, you don't have to reconstruct it from scratch."),
        p("for this project we created a /personal/fox-ricciardi/ folder... inside: source code, config files, change logs, docs — each in its own place. when we needed to update something, we knew exactly where to look."),
        h2("agents: think of them as specialized contractors"),
        p("we use a system called the ralph loop — seven ai agents, each with a specific job. one scopes the work, one designs the architecture, one stress-tests the design... then you've got a builder, a qa tester, a deploy agent, and one that captures learnings after each build."),
        p("why not just have one ai do everything? same reason you don't want your architect also installing your plumbing — specialization produces better output. each agent has explicit inputs and outputs, so nothing falls thru the cracks."),
        h2("what this looks like in practice"),
        p("before building this blog we ran thru the first three agents: scope, architecture, adversarial review. the scope agent helped define exactly what we were building and what we weren't. the architecture agent laid out the technical blueprint. the adversarial agent asked the hard questions — what happens if this breaks? what are we missing?"),
        p("only after that did we hand it to the builder... the whole thing was a few hours of back-and-forth with claude. no code written yet. just clarity."),
        h2("the non-technical takeaway"),
        p("you don't need to understand code to make good architectural decisions — you need to ask good questions. what problem am i solving? what's in scope? what could go wrong? the agents help structure that thinking and force you to answer before you build."),
        p("start organized. you'll move faster, not slower."),
        em("this is part 1 of a 4-part series on how i built this blog as a non-technical pm using claude... next up: version control without the fear."),
    )
}

# ─────────────────────────────────────────────────────────────────────────────
# Part 2
# ─────────────────────────────────────────────────────────────────────────────
post2 = {
    "title": "git without the fear",
    "slug": "building-with-ai-part-2-git",
    "excerpt": "if you've ever heard a developer mention 'pushing to main' and just nodded along... this post is for you. version control sounds way more complicated than it is.",
    "status": "published",
    "content": doc(
        p("if you've ever heard a developer mention \"pushing to main\" and just nodded along... this post is for you."),
        p("version control sounds way more complicated than it is. here's what you actually need to know."),
        h2("what git is (and isn't)"),
        p("git is a system that tracks changes to your code over time — think google docs' version history, but for an entire project. you can see every change ever made, who made it, and why... and you can roll back to any previous version if something breaks."),
        p("github is where that history lives online — a public or private home for your project's code."),
        h2("why we made our repo public"),
        p("we chose to make the fox-ricciardi.com repo public... a few reasons: public repos get access to github's branch protection features without a paid plan, and there's nothing sensitive in the code itself. api keys, passwords, credentials — all live in environment variables, never in the code."),
        p("if you're building something with proprietary business logic, private is the right call. for a personal blog or portfolio? public is fine."),
        h2("the three-branch strategy"),
        p("we use three environments: local, dev, and production — each with a corresponding branch in git."),
        p("feature branches are where new work happens... you create one, build something, test it there. the dev branch is staging — everything gets tested here before going live. main is production. only clean, tested code lands there."),
        p("the rule: never push directly to main. always go thru dev first. sounds like extra work... saves you from breaking a live site at the worst possible moment."),
        h2("branch protection in plain english"),
        p("we set up \"branch protection\" on main — a rule that says no one (including yourself) can merge code without going thru a pull request. a pull request is basically: \"here's what i built — review it before it goes live.\""),
        p("even solo, this discipline is worth it. it creates a checkpoint... a moment to ask: did i actually test this?"),
        h2("the non-technical takeaway"),
        p("you don't need to use the command line to understand this mental model. track your changes, test before publishing, protect your production environment — these aren't developer habits, they're good pm habits."),
        p("the tools just make them automatic."),
        em("part 2 of 4... next: how we chose our tech stack and why those decisions matter more than you'd think."),
    )
}

# ─────────────────────────────────────────────────────────────────────────────
# Part 3
# ─────────────────────────────────────────────────────────────────────────────
post3 = {
    "title": "choosing a tech stack (when you're not a developer)",
    "slug": "building-with-ai-part-3-stack",
    "excerpt": "when we sat down to build this blog, we had to make decisions most pms never face: what technology to build with. here's how we thought about it — and why it might matter to you.",
    "status": "published",
    "content": doc(
        p("when we sat down to build this blog we had to make a set of decisions most pms never face: what technology to build with. here's how we thought about it — and why it might matter to you."),
        h2("the front end: react + typescript + shadcn/ui"),
        p("the front end is what you see — the website itself. we chose react, a popular javascript framework, because it's well-documented, widely used, and claude handles it really well."),
        p("we added typescript, which is basically react with stricter rules — it catches errors before they happen. for a solo builder with no qa team, that's valuable."),
        p("for design we used shadcn/ui — a library of pre-built, polished ui components. buttons, forms, cards, tables — all professionally designed, ready to drop in. the alternative is building everything from scratch... that path leads to interfaces that look like they were built in 2009. we skipped it."),
        h2("the database and authentication: supabase"),
        p("supabase is a hosted database service that also handles user login — we use it for two things: storing blog posts, and authenticating the admin who manages them."),
        p("key word is \"hosted\" — we didn't install anything. created an account, set up a project, got a database that lives in the cloud. supabase has a dashboard (web interface) for browsing data and a cli (command line interface) for making changes programmatically."),
        p("learned this one fast: use the cli for anything structural. the dashboard is great for browsing data... but running migrations thru the cli keeps changes tracked and repeatable."),
        h2("hosting: vercel"),
        p("vercel is where the site lives. when we push code to github, vercel automatically builds and deploys it — zero manual steps. dev branch deploys to a staging url, main deploys to production. vercel also handles our blog api — small pieces of backend code that run on demand, no server required."),
        h2("the custom domain: godaddy → vercel"),
        p("buying a domain on godaddy and connecting it to vercel is mostly just dns configuration — telling the internet \"when someone types jake.foxricciardi.com, send them here.\" you update a cname record in godaddy's dashboard, verify it in vercel, wait for dns to propagate (usually under an hour)."),
        p("we documented this as a reusable template so we never have to figure it out again."),
        h2("the non-technical takeaway"),
        p("our stack decisions optimized for three things: speed (pre-built components), safety (hosted services, no servers to manage), and repeatability (documented templates). every decision assumed claude would be doing most of the building — so we chose tools claude handles well."),
        em("part 3 of 4... next: how we publish posts directly from claude without logging into any dashboard."),
    )
}

# ─────────────────────────────────────────────────────────────────────────────
# Part 4
# ─────────────────────────────────────────────────────────────────────────────
post4 = {
    "title": "publishing without a cms",
    "slug": "building-with-ai-part-4-publishing",
    "excerpt": "this is my favorite part of how the blog works: i don't log in to publish anything. here's how an api-first workflow makes claude the only interface you need.",
    "status": "published",
    "content": doc(
        p("this is my favorite part of how the blog works: i don't log in to publish anything."),
        p("most blogs run on a cms — content management system. wordpress, ghost, squarespace. you log in, click around, write your post, hit publish. it works... but it also means your blog is dependent on someone else's platform, their pricing, their interface."),
        p("we built something different — an api-first publishing workflow where claude cowork is the interface."),
        h2("what's an api?"),
        p("an api is a way for software to talk to software. when you post to instagram, your phone talks to instagram's servers thru an api... when a weather app shows you the forecast, it's pulling data thru a weather api."),
        p("we built a simple api for this blog. it accepts posts — title, slug, content, status — and saves them to the database. that's it."),
        h2("api keys: the front door"),
        p("to use the api you need an api key — think of it like a password you give to a specific application (in this case, claude) so it can act on your behalf. the key is stored securely in the database, and you can revoke it anytime."),
        p("i generated a key thru the admin dashboard, gave it to claude, and now claude can create and manage posts directly."),
        h2("the publishing workflow"),
        p("here's what creating this post actually looked like... i described the blog series i wanted to write in a conversation with claude. claude drafted all four posts. claude called the api with the content, title, slug, and \"published\" status. the posts appeared on the blog."),
        p("no cms login. no copy-paste. no formatting issues. just a conversation."),
        h2("why build this instead of using a cms?"),
        p("a few reasons — first, i own it. no platform risk. second, it integrates naturally with how i work with claude. third, it was a great way to understand how apis actually work in practice."),
        p("the tradeoff is real: no visual editor, no media library, no drag-and-drop... for a personal blog maintained thru claude, that's fine. for a team content operation, a real cms is probably the right call."),
        h2("the bigger picture"),
        p("what we built over these three days isn't just a blog — it's a template for how to approach any software project as a non-technical pm. define structure first, use proven tools, document decisions as you go, automate the repetitive parts."),
        p("the blog itself is almost incidental. the process is what's reusable."),
        em("that's a wrap on the series... next one goes deeper on the ralph loop — the seven-agent framework i use for building applications."),
    )
}

# ─────────────────────────────────────────────────────────────────────────────
# Publish
# ─────────────────────────────────────────────────────────────────────────────
posts = [post1, post2, post3, post4]

for i, post in enumerate(posts, 1):
    print(f"\n📤 Publishing Part {i}: {post['title']}")
    body = json.dumps(post).encode("utf-8")
    req = urllib.request.Request(
        API_URL,
        data=body,
        headers={
            "Authorization": f"Bearer {API_KEY}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            result = json.loads(resp.read())
            print(f"  ✅ Published — ID: {result['post']['id']} | slug: {result['post']['slug']}")
    except urllib.error.HTTPError as e:
        err = e.read().decode()
        print(f"  ❌ HTTP {e.code}: {err}")
    except Exception as e:
        print(f"  ❌ Error: {e}")

print("\nDone!")
