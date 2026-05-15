import { useProjects } from '@/hooks/useProjects'
import { ExternalLink } from 'lucide-react'

export function Projects() {
  const { data: projects, isLoading } = useProjects()

  if (isLoading) {
    return <div className="text-muted-foreground py-12">Loading projects…</div>
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Projects</h1>
        <p className="mt-2 text-muted-foreground">Things I've built.</p>
      </div>

      {!projects || projects.length === 0 ? (
        <p className="text-muted-foreground">Nothing here yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {projects.map((project) => (
            <a
              key={project.id}
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group border border-border rounded-xl overflow-hidden hover:border-foreground/30 transition-colors"
            >
              {project.image_url && (
                <div className="aspect-video w-full overflow-hidden bg-muted">
                  <img
                    src={project.image_url}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
              <div className="p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-lg leading-tight">{project.title}</h2>
                  <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0 ml-2" />
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{project.description}</p>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
