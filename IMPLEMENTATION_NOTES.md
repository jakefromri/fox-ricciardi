# Implementation Notes — fox-ricciardi.com

## Overview
A complete, production-ready personal blog/portfolio site for Jake Ricciardi built with React 18, TypeScript, Vite, and Supabase. No API server — all backend operations handled via Supabase client-side SDK and RLS policies.

## Key Architectural Decisions

### 1. Authentication & Authorization
- **Single-user system**: Only Jake can authenticate
- **Supabase Auth**: Email + password via supabase-js client
- **Session persistence**: onAuthStateChange listener in useAuth hook
- **Protected routes**: AdminLayout component guards all `/admin/*` routes except `/admin/login`
- **No invite system**: Not needed for single-user scenario

### 2. Data Fetching & Caching
- **TanStack Query v5**: All data fetching through useQuery/useMutation hooks
- **Query keys**: Hierarchical structure (e.g., `['posts', 'published']`)
- **Automatic invalidation**: Mutations invalidate related queries
- **Separation of concerns**: usePosts hooks encapsulate Supabase calls
- **Loading/error states**: Handled in page components

### 3. Database & Security
- **RLS-first approach**: No service role key in frontend
- **Policies**:
  - `posts` table: Anonymous can read published; Jake can read/write all
  - `profile` table: Anyone can read; Jake can update
- **Automatic timestamps**: moddatetime trigger for updated_at
- **Singleton profile**: Constraint check (id = 1) prevents duplicates
- **Content storage**: TipTap JSON stored in jsonb column

### 4. Slug Management
- **Auto-generation**: On post creation, slug auto-generated from title via slugify()
- **Editable before publish**: Can change slug up to first publication
- **Immutable after publish**: Slug locked after status = 'published' to prevent URL breaking
- **Unique constraint**: Prevents duplicate slugs

### 5. Published vs Draft Posts
- **Draft posts**: Visible only in admin, not published to blog/homepage
- **Published posts**: Have published_at timestamp, visible to public
- **One-time timestamp**: published_at set only on draft→published transition, not on edits
- **Query separation**: usePublishedPosts() for public, useAllPosts() for admin

### 6. Component Composition
- **UI Components**: shadcn/ui for all interactive elements (buttons, inputs, selects, etc.)
- **Layout wrapping**: PublicLayout vs AdminLayout provide consistent structure
- **Feature components**: PostCard, RichTextEditor encapsulate reusable patterns
- **Page organization**: Pages are thin controllers that compose components and hooks

### 7. Editor Implementation
- **TipTap v2 with StarterKit**: Bold, italic, heading, lists, code blocks
- **JSON storage**: Content stored as TipTap JSON (queryable, versioning-friendly)
- **Public rendering**: generateHTML() converts JSON to HTML (no editor instance)
- **Admin editing**: Full editor with toolbar in PostEditor component

## File Organization

```
src/
├── components/
│   ├── ui/              # shadcn/ui primitives (button, input, card, etc.)
│   ├── layout/          # Header, Footer, AdminLayout
│   ├── blog/            # PostCard
│   └── editor/          # RichTextEditor
├── pages/
│   ├── Home.tsx         # Public homepage
│   ├── Blog.tsx         # Public blog list
│   ├── BlogPost.tsx     # Public post view
│   └── admin/
│       ├── Login.tsx    # Auth form
│       ├── PostList.tsx # Admin table
│       ├── PostEditor.tsx # Create/edit
│       └── ProfileEditor.tsx # Profile form
├── hooks/
│   ├── useAuth.ts       # Session + login/logout
│   └── usePosts.ts      # All post queries/mutations
├── lib/
│   ├── supabase.ts      # Client singleton
│   └── utils.ts         # Helpers (slugify, formatDate, cn)
├── types/
│   └── index.ts         # Post, Profile interfaces
├── router.tsx           # React Router config
├── App.tsx              # Root with providers
└── main.tsx             # Entry point
```

## Route Map

### Public Routes (No Auth)
- `/` → Home.tsx
  - Profile bio
  - Social links (email, LinkedIn, Instagram)
  - 3 most recent published posts
- `/blog` → Blog.tsx
  - List all published posts with cards
- `/blog/:slug` → BlogPost.tsx
  - Individual post with HTML-rendered content

### Admin Routes (Protected by AdminLayout)
- `/admin/login` → Login.tsx (accessible without auth)
  - Email/password form
  - Redirects to `/admin/posts` on success
- `/admin/posts` → PostList.tsx
  - Table of all posts (draft + published)
  - Edit/delete actions
  - Create new post button
- `/admin/posts/new` → PostEditor.tsx
  - Create mode (empty form)
  - Auto-slug generation from title
  - Rich text editor
- `/admin/posts/:id/edit` → PostEditor.tsx
  - Edit mode (pre-filled form)
  - Slug locked after publish
- `/admin/profile` → ProfileEditor.tsx
  - Edit bio, email, LinkedIn URL, Instagram URL

## Database Schema

### posts table
```
id (uuid, PK)
title (text)
slug (text, unique)
content (jsonb) - TipTap JSON
excerpt (text, nullable)
status (text: 'draft' | 'published')
published_at (timestamptz, nullable)
created_at (timestamptz, auto)
updated_at (timestamptz, auto)
```

**RLS Policies:**
- `public_read_published`: SELECT for anon where status = 'published'
- `owner_all`: ALL for authenticated user

### profile table
```
id (int, PK, default 1)
bio (text)
linkedin_url (text, nullable)
instagram_url (text, nullable)
email (text, nullable)
updated_at (timestamptz, auto)
```

**RLS Policies:**
- `public_read`: SELECT for anon (true)
- `owner_write`: UPDATE for authenticated user

## Deployment Checklist

- [ ] Create Supabase project
- [ ] Run SQL migration
- [ ] Create Jake's Auth account
- [ ] Set .env.local with Supabase credentials
- [ ] npm install
- [ ] npm run build
- [ ] Deploy dist/ to Vercel/Netlify/static host
- [ ] Verify vercel.json rewrite rules for SPA routing
- [ ] Test homepage, blog, login flow

## Development Commands

```bash
# Install dependencies
npm install

# Development server (http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview
```

## Environment Variables

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Performance Considerations

- **Client-side rendering**: All heavy lifting in browser
- **Query caching**: TanStack Query prevents redundant API calls
- **Code splitting**: Vite automatically code-splits routes
- **Image optimization**: Consider adding next/image alternative for post images
- **Lazy loading**: React Router lazy() could be added for admin routes

## Possible Enhancements

1. **Comments system**: Add user comments to published posts
2. **Tags/Categories**: Organize posts by topic
3. **Search**: Full-text search over post content
4. **Analytics**: Track post views, page visits
5. **Drafts auto-save**: Save drafts periodically while editing
6. **Image uploads**: Support image embedding in posts
7. **Dark mode toggle**: Client-side theme switcher
8. **RSS feed**: Generate RSS from published posts
9. **Email newsletter**: Subscribe + email on new posts
10. **Multi-language**: Support multiple languages

## Known Limitations

- Single-user only (by design)
- No comments or user interaction
- No media upload (only text content)
- No scheduled publishing (publish immediately or save as draft)
- TipTap editor limited to basic formatting (extensible via plugins)

## Testing Recommendations

1. **Auth flow**: Login/logout → verify redirects work
2. **Post CRUD**: Create, edit, publish, delete posts
3. **Public pages**: Verify recent posts appear on homepage
4. **Slug immutability**: Try changing slug after publish (should be disabled)
5. **RLS**: Verify anonymous can't see draft posts
6. **Rich text**: Test bold, italic, headings, lists in editor
7. **Profile editing**: Update bio, links, verify changes persist
8. **Responsive**: Test on mobile/tablet/desktop

## Future Architecture Decisions

If this grows:
- Add API layer (Next.js API routes or separate backend) for more control
- Implement caching layer (Redis) for high-traffic scenarios
- Add email notifications (SendGrid, Resend)
- Implement rate limiting on Supabase edge functions
- Consider moving to multi-tenant architecture if monetized

---
Built with ♥ by Agent 04 (Builder)
