'use client';

import { useEffect, useState } from 'react';

type KeyRow = {
  id: string;
  name: string;
  key_prefix: string;
  created_at: string;
  last_used_at: string | null;
  revoked_at: string | null;
};

export function KeysClient() {
  const [keys, setKeys] = useState<KeyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [creating, setCreating] = useState(false);
  const [justCreated, setJustCreated] = useState<{ key: string; name: string } | null>(null);
  const [copied, setCopied] = useState(false);

  async function load() {
    setLoading(true);
    const r = await fetch('/api/keys');
    const j = await r.json();
    setKeys(j.keys || []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    const r = await fetch('/api/keys', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name: name || 'Default' }),
    });
    const j = await r.json();
    setCreating(false);
    if (j.key) {
      setJustCreated({ key: j.key, name: j.name });
      setName('');
      load();
    }
  }

  async function revoke(id: string) {
    if (!confirm('Revoke this key? Any apps using it will stop working immediately.')) return;
    await fetch(`/api/keys/${id}`, { method: 'DELETE' });
    load();
  }

  return (
    <div className="space-y-5">
      <form onSubmit={create} className="card p-4 flex flex-col sm:flex-row gap-3">
        <input
          className="input"
          placeholder="Key name (e.g. production-server)"
          value={name}
          onChange={e => setName(e.target.value)}
          maxLength={60}
        />
        <button className="btn btn-primary" type="submit" disabled={creating}>
          {creating ? 'Creating…' : 'Create new key'}
        </button>
      </form>

      {justCreated && (
        <div className="card p-5" style={{ borderColor: 'rgba(90,247,142,0.45)' }}>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <div className="text-xs uppercase tracking-widest text-[color:var(--accent)]">New key &mdash; copy it now</div>
              <div className="text-sm text-[color:var(--muted)] mt-1">For security, you won&rsquo;t see the full key again.</div>
            </div>
            <button onClick={() => setJustCreated(null)} className="btn btn-ghost py-1.5">Dismiss</button>
          </div>
          <div className="mt-4 flex gap-2 items-center">
            <code className="code flex-1 bg-[color:var(--panel-2)] border border-[color:var(--border)] rounded-lg px-3 py-2.5 text-sm break-all">
              {justCreated.key}
            </code>
            <button
              className="btn btn-ghost"
              onClick={() => { navigator.clipboard.writeText(justCreated.key); setCopied(true); setTimeout(() => setCopied(false), 1500); }}>
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="px-5 py-3 border-b border-[color:var(--border)] flex justify-between items-center">
          <div className="font-medium">Your keys</div>
          <div className="text-xs text-[color:var(--muted)]">{keys.length} total</div>
        </div>
        <div className="divide-row">
          {loading && <div className="p-5 text-sm text-[color:var(--muted)]">Loading…</div>}
          {!loading && keys.length === 0 && (
            <div className="p-8 text-center text-sm text-[color:var(--muted)]">
              No keys yet. Create one above to start sending requests.
            </div>
          )}
          {keys.map(k => (
            <div key={k.id} className="px-5 py-4 flex items-center justify-between gap-3 flex-wrap">
              <div className="min-w-0">
                <div className="font-medium truncate">{k.name}</div>
                <div className="text-xs text-[color:var(--muted)] mt-1 flex flex-wrap gap-x-3 gap-y-1">
                  <code className="code">{k.key_prefix}…</code>
                  <span>created {new Date(k.created_at).toLocaleDateString('en-US')}</span>
                  {k.last_used_at && <span>last used {new Date(k.last_used_at).toLocaleString('en-US')}</span>}
                  {k.revoked_at && <span className="text-[color:var(--danger)]">revoked</span>}
                </div>
              </div>
              {!k.revoked_at && (
                <button onClick={() => revoke(k.id)} className="btn btn-danger py-1.5">Revoke</button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
