import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Key, Copy, Check, Trash2, ExternalLink } from 'lucide-react'

interface ApiKey {
  id: string
  name: string
  key_prefix: string
  created_at: string
  last_used_at: string | null
  revoked_at: string | null
}

// Generate a cryptographically random API key
function generateKey(): string {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
  return `sk_${hex}`
}

// Hash using Web Crypto API (SHA-256)
async function hashKey(key: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(key)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

function useApiKeys() {
  return useQuery({
    queryKey: ['api_keys'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .is('revoked_at', null)
        .order('created_at', { ascending: false })
      if (error) throw new Error(error.message)
      return data as ApiKey[]
    },
  })
}

export function ApiKeys() {
  const queryClient = useQueryClient()
  const { data: keys, isLoading } = useApiKeys()

  const [newKeyName, setNewKeyName] = useState('')
  const [generatedKey, setGeneratedKey] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')

  const createKey = useMutation({
    mutationFn: async (name: string) => {
      const key = generateKey()
      const hash = await hashKey(key)
      const prefix = key.slice(3, 11) // 8 chars after "sk_"

      const { error } = await supabase.from('api_keys').insert({ name, key_hash: hash, key_prefix: prefix })
      if (error) throw new Error(error.message)
      return key
    },
    onSuccess: (key) => {
      setGeneratedKey(key)
      setNewKeyName('')
      queryClient.invalidateQueries({ queryKey: ['api_keys'] })
    },
    onError: (err) => setError(err instanceof Error ? err.message : 'Failed to create key'),
  })

  const revokeKey = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('api_keys')
        .update({ revoked_at: new Date().toISOString() })
        .eq('id', id)
      if (error) throw new Error(error.message)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['api_keys'] }),
    onError: (err) => setError(err instanceof Error ? err.message : 'Failed to revoke key'),
  })

  const handleCreate = () => {
    if (!newKeyName.trim()) {
      setError('Key name is required')
      return
    }
    setError('')
    createKey.mutate(newKeyName.trim())
  }

  const handleCopy = async () => {
    if (!generatedKey) return
    await navigator.clipboard.writeText(generatedKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold tracking-tight">API Keys</h1>
        <Link to="/docs" target="_blank">
          <Button variant="outline" size="sm" className="text-muted-foreground gap-1.5">
            <ExternalLink className="h-3.5 w-3.5" />
            API docs
          </Button>
        </Link>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">{error}</div>
      )}

      {/* One-time key reveal */}
      {generatedKey && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
          <p className="text-sm font-medium text-green-800">
            Key created — copy it now. It won't be shown again.
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-xs bg-white border border-green-200 rounded px-3 py-2 font-mono break-all">
              {generatedKey}
            </code>
            <Button size="sm" variant="outline" onClick={handleCopy} className="shrink-0">
              {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <Button size="sm" variant="ghost" className="text-muted-foreground" onClick={() => setGeneratedKey(null)}>
            Dismiss
          </Button>
        </div>
      )}

      {/* Create new key */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Generate a new key</CardTitle>
          <CardDescription>Give it a name so you know what it's used for</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="key-name">Key name</Label>
            <Input
              id="key-name"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              placeholder="e.g. Claude automation"
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            />
          </div>
          <Button onClick={handleCreate} disabled={createKey.isPending}>
            {createKey.isPending ? 'Generating...' : 'Generate key'}
          </Button>
        </CardContent>
      </Card>

      {/* Active keys list */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Active keys</CardTitle>
          <CardDescription>Revoking a key takes effect immediately</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground py-4">Loading...</p>
          ) : !keys || keys.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">No active keys yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {keys.map((key) => (
                <li key={key.id} className="flex items-center justify-between py-3 gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <Key className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{key.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">
                        sk_{key.key_prefix}… · Created {formatDate(key.created_at)}
                        {key.last_used_at && ` · Last used ${formatDate(key.last_used_at)}`}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-muted-foreground hover:text-destructive shrink-0"
                    onClick={() => revokeKey.mutate(key.id)}
                    disabled={revokeKey.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
