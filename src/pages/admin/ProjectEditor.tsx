import { useState } from 'react'
import { useProjects, useCreateProject, useUpdateProject, useDeleteProject } from '@/hooks/useProjects'
import { Project } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Pencil, Trash2, Plus, X, Check } from 'lucide-react'

type FormState = Omit<Project, 'id' | 'created_at' | 'updated_at'>

const emptyForm = (): FormState => ({
  title: '',
  description: '',
  link: '',
  image_url: '',
  order: 0,
})

export function ProjectEditor() {
  const { data: projects, isLoading } = useProjects()
  const createProject = useCreateProject()
  const updateProject = useUpdateProject()
  const deleteProject = useDeleteProject()

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm())
  const [error, setError] = useState<string | null>(null)

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyForm())
    setError(null)
    setShowForm(true)
  }

  const openEdit = (project: Project) => {
    setEditingId(project.id)
    setForm({
      title: project.title,
      description: project.description,
      link: project.link,
      image_url: project.image_url ?? '',
      order: project.order,
    })
    setError(null)
    setShowForm(true)
  }

  const cancel = () => {
    setShowForm(false)
    setEditingId(null)
    setForm(emptyForm())
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const payload = {
      ...form,
      image_url: form.image_url?.trim() || null,
      order: Number(form.order),
    }

    try {
      if (editingId) {
        await updateProject.mutateAsync({ id: editingId, project: payload })
      } else {
        await createProject.mutateAsync(payload)
      }
      cancel()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return
    try {
      await deleteProject.mutateAsync(id)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete project')
    }
  }

  if (isLoading) {
    return <div className="text-muted-foreground py-12">Loading…</div>
  }

  const isPending = createProject.isPending || updateProject.isPending

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold tracking-tight">Projects</h1>
        {!showForm && (
          <Button size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4 mr-1" /> Add project
          </Button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="border border-border rounded-xl p-6 space-y-4">
          <h2 className="font-medium">{editingId ? 'Edit project' : 'New project'}</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                required
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="link">URL</Label>
              <Input
                id="link"
                type="url"
                required
                placeholder="https://"
                value={form.link}
                onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              required
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="image_url">Preview image URL <span className="text-muted-foreground text-xs">(optional)</span></Label>
              <Input
                id="image_url"
                type="url"
                placeholder="https://"
                value={form.image_url ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="order">Order</Label>
              <Input
                id="order"
                type="number"
                value={form.order}
                onChange={(e) => setForm((f) => ({ ...f, order: Number(e.target.value) }))}
              />
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={isPending}>
              <Check className="h-4 w-4 mr-1" />
              {isPending ? 'Saving…' : 'Save'}
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={cancel}>
              <X className="h-4 w-4 mr-1" /> Cancel
            </Button>
          </div>
        </form>
      )}

      {!projects || projects.length === 0 ? (
        <p className="text-muted-foreground">No projects yet. Add one above.</p>
      ) : (
        <div className="space-y-3">
          {projects.map((project) => (
            <div
              key={project.id}
              className="flex items-start justify-between border border-border rounded-xl p-4 gap-4"
            >
              <div className="flex gap-4 items-start min-w-0">
                {project.image_url && (
                  <img
                    src={project.image_url}
                    alt={project.title}
                    className="w-16 h-12 object-cover rounded-md shrink-0"
                  />
                )}
                <div className="min-w-0">
                  <p className="font-medium truncate">{project.title}</p>
                  <p className="text-sm text-muted-foreground line-clamp-1">{project.description}</p>
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-muted-foreground hover:text-foreground truncate block"
                  >
                    {project.link}
                  </a>
                </div>
              </div>
              <div className="flex gap-1 shrink-0">
                <Button variant="ghost" size="sm" onClick={() => openEdit(project)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(project.id, project.title)}
                  disabled={deleteProject.isPending}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
