import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { StoreGame, type GameDisplay } from '@/components/StoreGame'

const DEFAULT_INTRO = 'Navigate the aisles. Find the displays. Learn something.'

export function StorePage() {
  const [displays, setDisplays] = useState<GameDisplay[]>([])
  const [introText, setIntroText] = useState(DEFAULT_INTRO)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      const [displaysRes, settingsRes] = await Promise.all([
        supabase.from('game_displays').select('*').order('sort_order'),
        supabase.from('store_settings').select('intro_text').eq('id', 1).single(),
      ])

      if (displaysRes.error) {
        setError('Failed to load game data.')
        console.error(displaysRes.error)
      } else {
        setDisplays(displaysRes.data ?? [])
      }

      if (settingsRes.data?.intro_text) {
        setIntroText(settingsRes.data.intro_text)
      }

      setLoading(false)
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div
        className="flex items-center justify-center"
        style={{
          height: 576,
          background: '#000088',
          border: '4px solid #FFD700',
          fontFamily: "'Courier New', monospace",
          color: '#FFD700',
          fontSize: 18,
          letterSpacing: 3,
        }}
      >
        LOADING...
      </div>
    )
  }

  if (error || displays.length === 0) {
    return (
      <div
        className="flex items-center justify-center"
        style={{
          height: 576,
          background: '#000088',
          border: '4px solid #FF4444',
          fontFamily: "'Courier New', monospace",
          color: '#FF4444',
          fontSize: 14,
          letterSpacing: 2,
          textAlign: 'center',
          padding: 32,
        }}
      >
        {error ?? 'No displays found. Run the Supabase migration first.'}
      </div>
    )
  }

  return (
    // Break out of the blog's max-w-4xl container — the game needs full 800px width
    <div className="-mx-4 flex justify-center">
      <StoreGame displays={displays} introText={introText} />
    </div>
  )
}
