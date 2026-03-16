import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { type GameDisplay } from '@/components/StoreGame'

interface EditState {
  label: string
  title: string
  content: string
  color: string
  glow: string
}

export function StoreEditor() {
  const [displays, setDisplays] = useState<GameDisplay[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editState, setEditState] = useState<EditState | null>(null)
  const [saving, setSaving] = useState(false)
  const [savedId, setSavedId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Intro text state
  const [introText, setIntroText] = useState('')
  const [introEditing, setIntroEditing] = useState(false)
  const [introSaving, setIntroSaving] = useState(false)
  const [introSaved, setIntroSaved] = useState(false)
  const [introDraft, setIntroDraft] = useState('')

  useEffect(() => {
    fetchAll()
  }, [])

  async function fetchAll() {
    setLoading(true)
    const [displaysRes, settingsRes] = await Promise.all([
      supabase.from('game_displays').select('*').order('sort_order'),
      supabase.from('store_settings').select('intro_text').eq('id', 1).single(),
    ])
    if (displaysRes.error) setError(displaysRes.error.message)
    else setDisplays(displaysRes.data ?? [])
    if (settingsRes.data?.intro_text) setIntroText(settingsRes.data.intro_text)
    setLoading(false)
  }

  function startIntroEdit() {
    setIntroDraft(introText)
    setIntroEditing(true)
    setIntroSaved(false)
  }

  async function saveIntro() {
    setIntroSaving(true)
    const { error } = await supabase
      .from('store_settings')
      .update({ intro_text: introDraft, updated_at: new Date().toISOString() })
      .eq('id', 1)
    setIntroSaving(false)
    if (error) {
      setError(error.message)
    } else {
      setIntroText(introDraft)
      setIntroEditing(false)
      setIntroSaved(true)
    }
  }

  async function fetchDisplays() {
    setLoading(true)
    const { data, error } = await supabase
      .from('game_displays')
      .select('*')
      .order('sort_order')
    if (error) setError(error.message)
    else setDisplays(data ?? [])
    setLoading(false)
  }

  function startEdit(d: GameDisplay) {
    setEditingId(d.id)
    setEditState({ label: d.label, title: d.title, content: d.content, color: d.color, glow: d.glow })
    setError(null)
    setSavedId(null)
  }

  function cancelEdit() {
    setEditingId(null)
    setEditState(null)
    setError(null)
  }

  async function saveEdit(id: number) {
    if (!editState) return
    setSaving(true)
    setError(null)
    const { error } = await supabase
      .from('game_displays')
      .update({
        label: editState.label,
        title: editState.title,
        content: editState.content,
        color: editState.color,
        glow: editState.glow,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
    setSaving(false)
    if (error) {
      setError(error.message)
    } else {
      setSavedId(id)
      setEditingId(null)
      setEditState(null)
      await fetchDisplays()
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Store Game — Display Editor</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Edit the start screen and kiosk panels shown on the{' '}
            <a href="/store" target="_blank" className="underline">/store</a> page.
            Changes go live immediately — no redeploy needed.
          </p>
        </div>
      </div>

      {error && (
        <div className="text-sm text-destructive border border-destructive/40 bg-destructive/10 rounded px-4 py-3">
          {error}
        </div>
      )}

      {/* ── Start screen intro text ── */}
      <div className="border border-border rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 bg-muted/40">
          <div className="flex items-center gap-3">
            <span className="inline-block w-4 h-4 rounded-sm border border-border bg-[#000088]" />
            <span className="font-mono font-semibold text-sm">START SCREEN</span>
            <span className="text-muted-foreground text-sm">Intro text shown before the game begins</span>
          </div>
          <div className="flex items-center gap-2">
            {introSaved && !introEditing && (
              <span className="text-xs text-green-600 font-medium">Saved ✓</span>
            )}
            {!introEditing && (
              <Button variant="outline" size="sm" onClick={startIntroEdit}>Edit</Button>
            )}
          </div>
        </div>

        {!introEditing && (
          <div className="px-4 py-3">
            <p className="text-sm text-muted-foreground font-mono">{introText}</p>
          </div>
        )}

        {introEditing && (
          <div className="p-4 space-y-3 border-t border-border">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Intro text (plain text, shown on the start screen before the game begins)
              </label>
              <textarea
                className="w-full rounded border border-border bg-background px-3 py-2 text-sm font-mono leading-relaxed"
                rows={4}
                value={introDraft}
                onChange={(e) => setIntroDraft(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={saveIntro} disabled={introSaving}>
                {introSaving ? 'Saving...' : 'Save changes'}
              </Button>
              <Button variant="ghost" onClick={() => setIntroEditing(false)} disabled={introSaving}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ── Kiosk displays ── */}
      <div className="space-y-4">
        {displays.map((d) => (
          <div key={d.id} className="border border-border rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-muted/40">
              <div className="flex items-center gap-3">
                <span
                  className="inline-block w-4 h-4 rounded-sm border border-border"
                  style={{ background: d.color }}
                />
                <span className="font-mono font-semibold text-sm">{d.label}</span>
                <span className="text-muted-foreground text-sm">{d.title}</span>
              </div>
              <div className="flex items-center gap-2">
                {savedId === d.id && (
                  <span className="text-xs text-green-600 font-medium">Saved ✓</span>
                )}
                {editingId !== d.id && (
                  <Button variant="outline" size="sm" onClick={() => startEdit(d)}>
                    Edit
                  </Button>
                )}
              </div>
            </div>

            {editingId === d.id && editState && (
              <div className="p-4 space-y-4 border-t border-border">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Label (shown on kiosk face)
                    </label>
                    <input
                      className="w-full rounded border border-border bg-background px-3 py-2 text-sm font-mono"
                      value={editState.label}
                      maxLength={12}
                      onChange={(e) => setEditState({ ...editState, label: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Panel title
                    </label>
                    <input
                      className="w-full rounded border border-border bg-background px-3 py-2 text-sm font-mono"
                      value={editState.title}
                      onChange={(e) => setEditState({ ...editState, title: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Kiosk color
                    </label>
                    <input
                      type="color"
                      value={editState.color}
                      onChange={(e) => setEditState({ ...editState, color: e.target.value })}
                      className="w-8 h-8 rounded cursor-pointer border border-border"
                    />
                    <span className="text-xs font-mono text-muted-foreground">{editState.color}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Glow color
                    </label>
                    <input
                      type="color"
                      value={editState.glow}
                      onChange={(e) => setEditState({ ...editState, glow: e.target.value })}
                      className="w-8 h-8 rounded cursor-pointer border border-border"
                    />
                    <span className="text-xs font-mono text-muted-foreground">{editState.glow}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Content (HTML — use <code className="text-xs">&lt;span class="sec"&gt;</code>, <code className="text-xs">.hi</code>, <code className="text-xs">.dim</code>, <code className="text-xs">.bad</code>)
                  </label>
                  <textarea
                    className="w-full rounded border border-border bg-background px-3 py-2 text-xs font-mono leading-relaxed"
                    rows={12}
                    value={editState.content}
                    onChange={(e) => setEditState({ ...editState, content: e.target.value })}
                  />
                </div>

                <div className="flex items-center gap-3">
                  <Button onClick={() => saveEdit(d.id)} disabled={saving}>
                    {saving ? 'Saving...' : 'Save changes'}
                  </Button>
                  <Button variant="ghost" onClick={cancelEdit} disabled={saving}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
