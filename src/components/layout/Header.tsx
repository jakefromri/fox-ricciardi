import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'

export function Header() {
  const { session, signOut } = useAuth()

  return (
    <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-10">
      <nav className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link
          to="/"
          className="text-lg font-semibold tracking-tight hover:opacity-70 transition-opacity"
        >
          Jake Ricciardi
        </Link>
        <div className="flex items-center gap-5">
          <Link to="/blog">
            <span className="text-sm text-muted-foreground hover:text-foreground transition-colors">Blog</span>
          </Link>
          {session && (
            <>
              <Link to="/admin/posts">
                <span className="text-sm text-muted-foreground hover:text-foreground transition-colors">Admin</span>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground"
                onClick={async () => { await signOut() }}
              >
                Sign out
              </Button>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}
