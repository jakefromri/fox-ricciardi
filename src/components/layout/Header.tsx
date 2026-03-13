import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'

export function Header() {
  const { session, signOut } = useAuth()

  return (
    <header className="border-b border-border">
      <nav className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold">
          Jake Ricciardi
        </Link>
        <div className="flex items-center gap-4">
          <Link to="/blog">
            <span className="text-sm hover:underline">Blog</span>
          </Link>
          {session && (
            <>
              <Link to="/admin/posts">
                <span className="text-sm hover:underline">Admin</span>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={async () => {
                  await signOut()
                }}
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
