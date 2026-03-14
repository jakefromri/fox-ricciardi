const BASE = 'https://jake.foxricciardi.com'

export function ApiDocs() {
  return (
    <div className="max-w-3xl space-y-12 py-4">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight mb-3">Blog API</h1>
        <p className="text-muted-foreground leading-relaxed">
          A simple REST API for managing posts programmatically. All write endpoints require an API key
          generated from the{' '}
          <a href="/admin/api-keys" className="underline underline-offset-2 hover:text-foreground">
            admin panel
          </a>
          .
        </p>
      </div>

      {/* Auth */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight">Authentication</h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Pass your API key as a Bearer token in the <code className="font-mono bg-muted px-1 rounded">Authorization</code> header.
          GET /api/posts is public and requires no auth.
        </p>
        <Pre>{`Authorization: Bearer sk_your_key_here`}</Pre>
      </section>

      {/* Endpoints */}
      <section className="space-y-8">
        <h2 className="text-xl font-semibold tracking-tight">Endpoints</h2>

        <Endpoint
          method="GET"
          path="/api/posts"
          description="List all posts. Public — no auth required."
          response={`{\n  "posts": [\n    {\n      "id": "uuid",\n      "title": "My post",\n      "slug": "my-post",\n      "status": "published",\n      "excerpt": "...",\n      "published_at": "2026-03-01T00:00:00Z",\n      "created_at": "...",\n      "updated_at": "..."\n    }\n  ]\n}`}
          curl={`curl ${BASE}/api/posts`}
        />

        <Endpoint
          method="POST"
          path="/api/posts"
          description="Create a new post. Content must be TipTap JSON."
          body={`{\n  "title": "My new post",\n  "slug": "my-new-post",\n  "content": { "type": "doc", "content": [] },\n  "excerpt": "Optional summary",\n  "status": "draft"\n}`}
          response={`{ "post": { "id": "uuid", "title": "My new post", ... } }`}
          curl={`curl -X POST ${BASE}/api/posts \\\n  -H "Authorization: Bearer sk_..." \\\n  -H "Content-Type: application/json" \\\n  -d '{"title":"My post","slug":"my-post","content":{"type":"doc","content":[]}}'`}
        />

        <Endpoint
          method="PATCH"
          path="/api/posts/:id"
          description="Partially update a post. Only include fields you want to change."
          body={`{\n  "title": "Updated title",\n  "status": "published"\n}`}
          response={`{ "post": { "id": "uuid", "title": "Updated title", ... } }`}
          curl={`curl -X PATCH ${BASE}/api/posts/{id} \\\n  -H "Authorization: Bearer sk_..." \\\n  -H "Content-Type: application/json" \\\n  -d '{"status":"published"}'`}
        />

        <Endpoint
          method="DELETE"
          path="/api/posts/:id"
          description="Permanently delete a post."
          response={`{ "success": true }`}
          curl={`curl -X DELETE ${BASE}/api/posts/{id} \\\n  -H "Authorization: Bearer sk_..."`}
        />
      </section>

      {/* TipTap note */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight">Content format</h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          The <code className="font-mono bg-muted px-1 rounded">content</code> field uses{' '}
          <a href="https://tiptap.dev" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-foreground">
            TipTap
          </a>{' '}
          JSON. A minimal document with a heading and paragraph looks like:
        </p>
        <Pre>{`{
  "type": "doc",
  "content": [
    {
      "type": "heading",
      "attrs": { "level": 2 },
      "content": [{ "type": "text", "text": "Introduction" }]
    },
    {
      "type": "paragraph",
      "content": [{ "type": "text", "text": "Your content here." }]
    }
  ]
}`}</Pre>
      </section>
    </div>
  )
}

function Pre({ children }: { children: string }) {
  return (
    <pre className="bg-muted rounded-lg px-4 py-3 text-xs font-mono overflow-x-auto leading-relaxed whitespace-pre">
      {children}
    </pre>
  )
}

function Endpoint({
  method,
  path,
  description,
  body,
  response,
  curl,
}: {
  method: string
  path: string
  description: string
  body?: string
  response?: string
  curl?: string
}) {
  const methodColors: Record<string, string> = {
    GET: 'bg-blue-50 text-blue-700 border-blue-200',
    POST: 'bg-green-50 text-green-700 border-green-200',
    PATCH: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    DELETE: 'bg-red-50 text-red-700 border-red-200',
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <span className={`text-xs font-mono font-semibold px-2 py-0.5 rounded border ${methodColors[method]}`}>
          {method}
        </span>
        <code className="text-sm font-mono">{path}</code>
      </div>
      <p className="text-sm text-muted-foreground">{description}</p>
      {body && (
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Request body</p>
          <Pre>{body}</Pre>
        </div>
      )}
      {response && (
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Response</p>
          <Pre>{response}</Pre>
        </div>
      )}
      {curl && (
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Example</p>
          <Pre>{curl}</Pre>
        </div>
      )}
    </div>
  )
}
