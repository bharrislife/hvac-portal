'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  email: string
  role: 'admin' | 'sales'
  createdAt: string
}

export default function AdminPanel() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [newEmail, setNewEmail] = useState('')
  const [newRole, setNewRole] = useState<'admin' | 'sales'>('sales')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [])

  async function fetchUsers() {
    try {
      const response = await fetch('/api/admin/users')
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/')
          return
        }
        throw new Error('Failed to fetch users')
      }
      const data = await response.json()
      setUsers(data.users)
    } catch (err) {
      setError('Failed to load users')
      console.error(err)
    }
  }

  async function createUser(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newEmail, role: newRole }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to create user')
        return
      }

      setSuccess(`User created successfully! Default password: ${data.defaultPassword}`)
      setNewEmail('')
      setNewRole('sales')
      await fetchUsers()
    } catch (err) {
      setError('An error occurred')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function deleteUser(email: string) {
    if (!confirm(`Delete user ${email}?`)) return

    try {
      const response = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || 'Failed to delete user')
        return
      }

      setSuccess('User deleted successfully')
      await fetchUsers()
    } catch (err) {
      setError('Failed to delete user')
      console.error(err)
    }
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1>Admin Panel</h1>
        <button onClick={logout} style={styles.logoutBtn}>Logout</button>
      </header>

      <div style={styles.content}>
        <div style={styles.card}>
          <h2>Create New User</h2>

          {error && <div style={styles.error}>{error}</div>}
          {success && <div style={styles.success}>{success}</div>}

          <form onSubmit={createUser} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Email</label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="user@hvac.local"
                style={styles.input}
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Role</label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as 'admin' | 'sales')}
                style={styles.input}
              >
                <option value="sales">Sales Rep</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.button,
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? 'Creating...' : 'Create User'}
            </button>
          </form>
        </div>

        <div style={styles.card}>
          <h2>Manage Users</h2>

          {users.length === 0 ? (
            <p style={styles.empty}>No users yet</p>
          ) : (
            <div style={styles.table}>
              <div style={styles.tableHeader}>
                <div style={styles.tableCell}>Email</div>
                <div style={styles.tableCell}>Role</div>
                <div style={styles.tableCell}>Created</div>
                <div style={styles.tableCell}>Action</div>
              </div>

              {users.map((user) => (
                <div key={user.email} style={styles.tableRow}>
                  <div style={styles.tableCell}>{user.email}</div>
                  <div style={styles.tableCell}>
                    <span
                      style={{
                        ...styles.badge,
                        backgroundColor: user.role === 'admin' ? '#dbeafe' : '#dcfce7',
                        color: user.role === 'admin' ? '#1e40af' : '#166534',
                      }}
                    >
                      {user.role}
                    </span>
                  </div>
                  <div style={styles.tableCell}>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </div>
                  <div style={styles.tableCell}>
                    <button
                      onClick={() => deleteUser(user.email)}
                      style={styles.deleteBtn}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={styles.card}>
          <h2>Configuration</h2>
          <div style={styles.configInfo}>
            <h3>Vapi Integration</h3>
            <p>API Key: <code>b472be48-daaa-48c8-a48f-269933de07e8</code></p>
            <p>5 phone numbers available in the pool</p>

            <h3>Stripe Payment Links (HIDDEN FROM SALES REPS)</h3>
            <p><strong>Setup ($1,000):</strong> <a href="https://buy.stripe.com/00w4gygZF88EfPCd0i0RG07" target="_blank" style={styles.link}>View Link</a></p>
            <p><strong>Monthly ($200):</strong> <a href="https://buy.stripe.com/14A7sK24LcoU1YM2lE0RG08" target="_blank" style={styles.link}>View Link</a></p>

            <h3>Admin Credentials</h3>
            <p>Master Password: <code>SalesXf0le8tutter!</code></p>
          </div>
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: { minHeight: '100vh', backgroundColor: '#f0f2f5' } as React.CSSProperties,
  header: { backgroundColor: '#1f2937', color: 'white', padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' } as React.CSSProperties,
  logoutBtn: { padding: '8px 16px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' } as React.CSSProperties,
  content: { padding: '20px 40px', maxWidth: '1200px', margin: '0 auto' } as React.CSSProperties,
  card: { backgroundColor: 'white', borderRadius: '8px', padding: '24px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', marginBottom: '20px' } as React.CSSProperties,
  error: { backgroundColor: '#fee2e2', color: '#dc2626', padding: '12px', borderRadius: '4px', marginBottom: '16px', fontSize: '14px' } as React.CSSProperties,
  success: { backgroundColor: '#dcfce7', color: '#166534', padding: '12px', borderRadius: '4px', marginBottom: '16px', fontSize: '14px' } as React.CSSProperties,
  form: { marginBottom: '20px' } as React.CSSProperties,
  formGroup: { marginBottom: '16px' } as React.CSSProperties,
  label: { display: 'block', marginBottom: '4px', fontWeight: 'bold' as const, color: '#374151', fontSize: '14px' },
  input: { width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box' as const } as React.CSSProperties,
  button: { width: '100%', padding: '10px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', fontSize: '14px', fontWeight: 'bold' as const, cursor: 'pointer' } as React.CSSProperties,
  empty: { color: '#6b7280', fontSize: '14px' },
  table: { width: '100%' } as React.CSSProperties,
  tableHeader: { display: 'grid', gridTemplateColumns: '2fr 1fr 1.5fr 1fr', gap: '12px', padding: '12px 0', borderBottom: '2px solid #e5e7eb', fontWeight: 'bold' as const, color: '#374151', fontSize: '14px' } as React.CSSProperties,
  tableRow: { display: 'grid', gridTemplateColumns: '2fr 1fr 1.5fr 1fr', gap: '12px', padding: '12px 0', borderBottom: '1px solid #e5e7eb', alignItems: 'center', fontSize: '14px' } as React.CSSProperties,
  tableCell: { color: '#374151' },
  badge: { display: 'inline-block', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' as const } as React.CSSProperties,
  deleteBtn: { padding: '6px 12px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' } as React.CSSProperties,
  configInfo: { backgroundColor: '#f3f4f6', padding: '16px', borderRadius: '4px', fontSize: '14px' } as React.CSSProperties,
  link: { color: '#3b82f6', textDecoration: 'none' } as React.CSSProperties,
}
