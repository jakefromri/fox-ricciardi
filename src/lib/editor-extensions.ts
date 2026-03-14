/**
 * Shared TipTap extensions used by both the editor and the blog post renderer.
 * Keeping them in one place ensures the JSON written by the editor can always
 * be read back by the renderer.
 */
import { Node, Mark, mergeAttributes } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import CodeBlock from '@tiptap/extension-code-block'

// ─── Image ────────────────────────────────────────────────────────────────────

export const CustomImage = Node.create({
  name: 'image',
  inline: false,
  group: 'block',
  draggable: true,

  addAttributes() {
    return {
      src: { default: null },
      alt: { default: null },
      title: { default: null },
    }
  },

  parseHTML() {
    return [{ tag: 'img[src]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['img', mergeAttributes({ class: 'blog-image' }, HTMLAttributes)]
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  addCommands(): any {
    return {
      setImage:
        (options: { src: string; alt?: string; title?: string }) =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ({ commands }: any) => {
          return commands.insertContent({ type: this.name, attrs: options })
        },
    }
  },
})

// ─── Link ─────────────────────────────────────────────────────────────────────

export const CustomLink = Mark.create({
  name: 'link',
  priority: 1000,
  keepOnSplit: false,
  inclusive: false,

  addAttributes() {
    return {
      href: { default: null },
      target: { default: '_blank' },
      rel: { default: 'noopener noreferrer' },
    }
  },

  parseHTML() {
    return [{ tag: 'a[href]:not([href *= "javascript:" i])' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['a', mergeAttributes(HTMLAttributes), 0]
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  addCommands(): any {
    return {
      setLink:
        (attrs: { href: string; target?: string }) =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ({ commands }: any) => {
          return commands.setMark(this.name, attrs)
        },
      unsetLink:
        () =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ({ commands }: any) => {
          return commands.unsetMark(this.name)
        },
    }
  },
})

// ─── Extension bundles ────────────────────────────────────────────────────────

/**
 * Full extension set for the TipTap editor (includes Placeholder).
 */
export const getEditorExtensions = (placeholder = 'Write something…') => [
  StarterKit.configure({
    // Disable StarterKit's built-in code block; we add CodeBlock below
    // with language support.
    codeBlock: false,
  }),
  CodeBlock.configure({
    HTMLAttributes: { spellcheck: 'false' },
  }),
  Placeholder.configure({ placeholder }),
  CustomImage,
  CustomLink,
]

/**
 * Extension set for generateHTML in the blog renderer (no Placeholder needed).
 */
export const getRendererExtensions = () => [
  StarterKit.configure({ codeBlock: false }),
  CodeBlock,
  CustomImage,
  CustomLink,
]
