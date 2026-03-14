# BLOG-5 — Rich Text Post Editor

**Status:** Ready to deploy
**Date:** 2026-03-14

## What changed

### New file — `src/lib/editor-extensions.ts`
Single source of truth for all TipTap extensions. Both the editor and the blog post renderer import from here, so the JSON written by the editor is always correctly deserialised for display.

Exports:
- `CustomImage` — block-level image node with `src`, `alt`, `title` attributes
- `CustomLink` — inline link mark with `href`, `target`, `rel` attributes
- `getEditorExtensions(placeholder?)` — full set for the TipTap editor instance
- `getRendererExtensions()` — same set minus Placeholder, used by `generateHTML`

Note: `@tiptap/extension-image` and `@tiptap/extension-link` were not installable from npm in this environment, so Image and Link are implemented as lightweight custom extensions using `@tiptap/core` (already installed). Behaviour is equivalent to the official extensions.

### Updated — `src/components/editor/RichTextEditor.tsx`
Fully rebuilt toolbar. Now includes:

| Group | Buttons |
|---|---|
| Style | Bold, Italic |
| Headings | H2, H3 |
| Blocks | Bullet list, Numbered list, Blockquote |
| Code | Inline code, Code block |
| Links | Insert/edit link (inline URL bar), Remove link |
| Images | Upload image (uses `onImageUpload` callback) |
| Misc | Horizontal rule, Undo, Redo |

New `onImageUpload?: (file: File) => Promise<string>` prop — if provided, the image button appears. On click, opens a file picker, uploads the file, and inserts the image inline into the editor.

Link editing: clicking the link button opens an inline bar below the toolbar with a URL input. Empty URL removes the link; entering a URL applies it. Esc closes the bar.

Editor content area now has WYSIWYG CSS (`editor-content .tiptap`) that mirrors the `blog-content` public styles.

### Updated — `src/pages/admin/PostEditor.tsx`
Passes an `onImageUpload` callback to `RichTextEditor` that uploads to the `post-images` Supabase storage bucket (same bucket used for cover images). Uses the same upload path pattern as the cover image logic.

### Updated — `src/pages/BlogPost.tsx`
Now uses `getRendererExtensions()` instead of manually listing `[StarterKit, Placeholder]`. This ensures images, links, and code blocks stored in post JSON are correctly rendered to HTML.

### Updated — `src/index.css`
Added:
- `.blog-content img.blog-image` — image display in rendered posts
- `.editor-content .tiptap *` — full WYSIWYG styles matching the blog view (headings, lists, blockquote, code, images, links, hr, placeholder)
- `.editor-content .tiptap img.ProseMirror-selectednode` — selection ring on images in editor

## Deploy steps
1. `npm run build` — verify no errors
2. Push to `dev` branch → verify on staging
3. Merge to `main` → Vercel auto-deploys

## Known limitations / follow-ups
- No syntax highlighting in code blocks (lowlight/highlight.js not installable in this environment). Code blocks render with clean monospace styling. Can add syntax highlighting in a follow-up once packages are accessible.
- No language selector UI on code blocks yet. TipTap stores the language attribute if set via `toggleCodeBlock({ language: 'js' })` but there's no toolbar picker.
- Image captions not supported in v1.
