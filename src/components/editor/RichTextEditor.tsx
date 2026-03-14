import { useRef, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import { getEditorExtensions } from '@/lib/editor-extensions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  FileCode2,
  Link2,
  Link2Off,
  ImagePlus,
  Minus,
  Undo2,
  Redo2,
} from 'lucide-react'

interface RichTextEditorProps {
  content: Record<string, unknown>
  onChange: (json: Record<string, unknown>) => void
  /** Optional — if provided, the image upload button becomes active. */
  onImageUpload?: (file: File) => Promise<string>
}

export function RichTextEditor({ content, onChange, onImageUpload }: RichTextEditorProps) {
  const imageInputRef = useRef<HTMLInputElement>(null)
  const [linkBarOpen, setLinkBarOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [isUploadingImage, setIsUploadingImage] = useState(false)

  const editor = useEditor({
    extensions: getEditorExtensions('Write something…'),
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON() as Record<string, unknown>)
    },
  })

  if (!editor) return null

  // ─── Link helpers ──────────────────────────────────────────────────────────

  const openLinkBar = () => {
    const existing = editor.getAttributes('link').href as string | undefined
    setLinkUrl(existing ?? '')
    setLinkBarOpen(true)
  }

  const applyLink = () => {
    const url = linkUrl.trim()
    if (!url) {
      editor.chain().focus().unsetMark('link').run()
    } else {
      const href = url.startsWith('http') ? url : `https://${url}`
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(editor.chain().focus() as any).setLink({ href, target: '_blank' }).run()
    }
    setLinkBarOpen(false)
    setLinkUrl('')
  }

  const removeLink = () => {
    editor.chain().focus().unsetMark('link').run()
    setLinkBarOpen(false)
  }

  // ─── Image helpers ─────────────────────────────────────────────────────────

  const handleImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !onImageUpload) return

    setIsUploadingImage(true)
    try {
      const url = await onImageUpload(file)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(editor.chain().focus() as any).setImage({ src: url, alt: file.name }).run()
    } finally {
      setIsUploadingImage(false)
      if (imageInputRef.current) imageInputRef.current.value = ''
    }
  }

  // ─── Toolbar button helper ─────────────────────────────────────────────────

  const ToolBtn = ({
    active,
    disabled,
    onClick,
    title,
    children,
  }: {
    active?: boolean
    disabled?: boolean
    onClick: () => void
    title: string
    children: React.ReactNode
  }) => (
    <Button
      type="button"
      size="sm"
      variant={active ? 'default' : 'ghost'}
      className="h-8 w-8 p-0"
      disabled={disabled}
      onMouseDown={(e) => { e.preventDefault(); onClick() }}
      title={title}
    >
      {children}
    </Button>
  )

  const Divider = () => <div className="w-px h-5 bg-border mx-1 self-center" />

  return (
    <Card className="overflow-hidden">
      {/* ── Toolbar ─────────────────────────────────────────────────────── */}
      <div className="border-b border-border px-3 py-2 flex flex-wrap gap-0.5 items-center bg-muted/40">
        {/* Text style */}
        <ToolBtn
          active={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
          title="Bold (⌘B)"
        >
          <Bold className="h-3.5 w-3.5" />
        </ToolBtn>
        <ToolBtn
          active={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          title="Italic (⌘I)"
        >
          <Italic className="h-3.5 w-3.5" />
        </ToolBtn>

        <Divider />

        {/* Headings */}
        <ToolBtn
          active={editor.isActive('heading', { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          title="Heading 2"
        >
          <Heading2 className="h-3.5 w-3.5" />
        </ToolBtn>
        <ToolBtn
          active={editor.isActive('heading', { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          title="Heading 3"
        >
          <Heading3 className="h-3.5 w-3.5" />
        </ToolBtn>

        <Divider />

        {/* Lists + blockquote */}
        <ToolBtn
          active={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          title="Bullet list"
        >
          <List className="h-3.5 w-3.5" />
        </ToolBtn>
        <ToolBtn
          active={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          title="Numbered list"
        >
          <ListOrdered className="h-3.5 w-3.5" />
        </ToolBtn>
        <ToolBtn
          active={editor.isActive('blockquote')}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          title="Blockquote"
        >
          <Quote className="h-3.5 w-3.5" />
        </ToolBtn>

        <Divider />

        {/* Code */}
        <ToolBtn
          active={editor.isActive('code')}
          onClick={() => editor.chain().focus().toggleCode().run()}
          title="Inline code"
        >
          <Code className="h-3.5 w-3.5" />
        </ToolBtn>
        <ToolBtn
          active={editor.isActive('codeBlock')}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          title="Code block"
        >
          <FileCode2 className="h-3.5 w-3.5" />
        </ToolBtn>

        <Divider />

        {/* Link */}
        <ToolBtn
          active={editor.isActive('link') || linkBarOpen}
          onClick={openLinkBar}
          title="Insert / edit link"
        >
          <Link2 className="h-3.5 w-3.5" />
        </ToolBtn>
        {editor.isActive('link') && (
          <ToolBtn active={false} onClick={removeLink} title="Remove link">
            <Link2Off className="h-3.5 w-3.5" />
          </ToolBtn>
        )}

        {/* Image */}
        {onImageUpload && (
          <>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={handleImageFile}
            />
            <ToolBtn
              disabled={isUploadingImage}
              onClick={() => imageInputRef.current?.click()}
              title={isUploadingImage ? 'Uploading…' : 'Insert image'}
            >
              <ImagePlus className="h-3.5 w-3.5" />
            </ToolBtn>
          </>
        )}

        <Divider />

        {/* Horizontal rule */}
        <ToolBtn
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Horizontal rule"
        >
          <Minus className="h-3.5 w-3.5" />
        </ToolBtn>

        <Divider />

        {/* Undo / Redo */}
        <ToolBtn
          disabled={!editor.can().undo()}
          onClick={() => editor.chain().focus().undo().run()}
          title="Undo (⌘Z)"
        >
          <Undo2 className="h-3.5 w-3.5" />
        </ToolBtn>
        <ToolBtn
          disabled={!editor.can().redo()}
          onClick={() => editor.chain().focus().redo().run()}
          title="Redo (⌘⇧Z)"
        >
          <Redo2 className="h-3.5 w-3.5" />
        </ToolBtn>
      </div>

      {/* ── Link bar ────────────────────────────────────────────────────── */}
      {linkBarOpen && (
        <div className="border-b border-border px-3 py-2 flex gap-2 items-center bg-muted/20">
          <Link2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <Input
            className="h-7 text-sm flex-1"
            placeholder="https://example.com"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') applyLink()
              if (e.key === 'Escape') setLinkBarOpen(false)
            }}
            autoFocus
          />
          <Button type="button" size="sm" className="h-7 text-xs px-3" onClick={applyLink}>
            Apply
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-7 text-xs px-3"
            onClick={() => setLinkBarOpen(false)}
          >
            Cancel
          </Button>
        </div>
      )}

      {/* ── Editor content ──────────────────────────────────────────────── */}
      <EditorContent editor={editor} className="editor-content min-h-[320px] p-4" />
    </Card>
  )
}
