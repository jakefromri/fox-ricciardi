import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

const CAT_GIF_URL = 'https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif'
const REDIRECT_SECONDS = 5

export function NotFound() {
  const navigate = useNavigate()
  const [countdown, setCountdown] = useState(REDIRECT_SECONDS)

  useEffect(() => {
    if (countdown <= 0) {
      navigate('/')
      return
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [countdown, navigate])

  return (
    <div className="flex flex-col items-center justify-center text-center py-20 space-y-6">
      <img
        src={CAT_GIF_URL}
        alt="cat on laptop"
        className="w-64 h-64 rounded-xl object-cover shadow-md"
      />
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">oops, this is embarrassing.</h1>
        <p className="text-muted-foreground text-lg">
          looks like something is wrong. sre is on it.
        </p>
      </div>
      <p className="text-sm text-muted-foreground">
        taking you home in {countdown}…
      </p>
      <Link to="/">
        <Button variant="outline">take me home</Button>
      </Link>
    </div>
  )
}
