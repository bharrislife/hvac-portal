'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface PoolStatus {
  available: number
  inUse: number
  permanent: number
  total: number
}

interface DemoPhone {
  phoneNumber: string
  phoneId: string
  prospectName: string
  areaCode: string
}

export default function Dashboard() {
  const router = useRouter()
  const [prospectName, setProspectName] = useState('')
  const [areaCode, setAreaCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [poolStatus, setPoolStatus] = useState<PoolStatus | null>(null)
  const [demoPhone, setDemoPhone] = useState<DemoPhone | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchPoolStatus()
  }, [])

  async function fetchPoolStatus() {
    try {
      const response = await fetch('/api/phone/pool-status')
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/')
          return
        }
        throw new Error('Failed to fetch pool status')
      }
      const data = await response.json()
      setPoolStatus(data.stats)
    } catch (err) {
      console.error(err)
    }
  }

  async function generateDemo(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/phone/get-demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prospectName, areaCode }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to generate demo')
        return
      }

      setDemoPhone({
        phoneNumber: data.phoneNumber,
        phoneId: data.phoneId,
        prospectName,
        areaCode,
      })

      setProspectName('')
      setAreaCode('')
      await fetchPoolStatus()
    } catch (err) {
      setError('An error occurred. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function releaseDemo() {
    if (!demoPhone) return

    try {
      const response = await fetch('/api/phone/release-demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneId: demoPhone.phoneId }),
      })

      if (!response.ok) {
        throw new Error('Failed to release demo')
      }

      setDemoPhone(null)
      await fetchPoolStatus()
    } catch (err) {
      setError('Failed to release demo')
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
        <h1>Sales Rep Dashboard</h1>
        <button onClick={logout} style={styles.logoutBtn}>Logout</button>
      </header>

      <div style={styles.mainContent}>
        <div style={styles.column}>
          <div style={styles.card}>
            <h2>Generate Demo</h2>
            <p style={styles.cardDescription}>Enter prospect details to get a customized demo phone number</p>

            {error && <div style={styles.error}>{error}</div>}

            <form onSubmit={generateDemo} style={styles.form}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Prospect Name</label>
                <input
                  type="text"
                  value={prospectName}
                  onChange={(e) => setProspectName(e.target.value)}
                  placeholder="e.g., John Smith"
                  style={styles.input}
                  required
                  disabled={!!demoPhone}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Area Code</label>
                <input
                  type="text"
                  value={areaCode}
                  onChange={(e) => setAreaCode(e.target.value)}
                  placeholder="e.g., 708"
                  style={styles.input}
                  required
                  disabled={!!demoPhone}
                  pattern="[0-9]{3}"
                  maxLength={3}
                />
              </div>

              <button
                type="submit"
                disabled={loading || !!demoPhone}
                style={{
                  ...styles.button,
                  opacity: loading || !!demoPhone ? 0.6 : 1,
                }}
              >
                {loading ? 'Generating...' : 'Generate Demo Number'}
              </button>
            </form>

            {demoPhone && (
              <div style={styles.demoResult}>
                <h3 style={styles.demoTitle}>🎉 Demo Ready!</h3>
                <div style={styles.demoContent}>
                  <div style={styles.demoLine}>
                    <span style={styles.demoLabel}>Prospect:</span>
                    <span style={styles.demoValue}>{demoPhone.prospectName}</span>
                  </div>
                  <div style={styles.demoLine}>
                    <span style={styles.demoLabel}>Area Code:</span>
                    <span style={styles.demoValue}>{demoPhone.areaCode}</span>
                  </div>
                  <div style={styles.phoneDisplay}>
                    <span style={styles.phoneLabel}>Demo Number:</span>
                    <div style={styles.phoneNumber}>{demoPhone.phoneNumber}</div>
                  </div>
                  <p style={styles.demoNote}>
                    The voice script has been customized to mention {demoPhone.prospectName} by name.
                  </p>
                </div>
                <button onClick={releaseDemo} style={styles.releaseBtn}>
                  Release Demo (Prospect Declined)
                </button>
              </div>
            )}
          </div>
        </div>

        <div style={styles.column}>
          <div style={styles.card}>
            <h2>Phone Pool Status</h2>
            {poolStatus && (
              <div style={styles.statusGrid}>
                <div style={styles.statusItem}>
                  <div style={styles.statusNumber}>{poolStatus.available}</div>
                  <div style={styles.statusLabel}>Available</div>
                </div>
                <div style={styles.statusItem}>
                  <div style={styles.statusNumber}>{poolStatus.inUse}</div>
                  <div style={styles.statusLabel}>In Use</div>
                </div>
                <div style={styles.statusItem}>
                  <div style={styles.statusNumber}>{poolStatus.permanent}</div>
                  <div style={styles.statusLabel}>Permanent</div>
                </div>
              </div>
            )}

            {poolStatus && poolStatus.available === 0 && !demoPhone && (
              <div style={styles.warning}>
                ⚠️ No available demo numbers. Wait for a colleague to release their demo.
              </div>
            )}
          </div>

          <div style={styles.card}>
            <h2>Onboarding Checklist</h2>
            <div style={styles.checklistItem}>
              <input type="checkbox" defaultChecked style={styles.checkbox} />
              <span>Generate demo phone number</span>
            </div>
            <div style={styles.checklistItem}>
              <input type="checkbox" style={styles.checkbox} />
              <span>Make cold call to prospect</span>
            </div>
            <div style={styles.checklistItem}>
              <input type="checkbox" style={styles.checkbox} />
              <span>Prospect interested? Send to setup payment</span>
            </div>
            <div style={styles.checklistItem}>
              <input type="checkbox" style={styles.checkbox} />
              <span>Earn commission! 🎉</span>
            </div>
          </div>

          <div style={styles.card}>
            <h2>💰 Payment Links (Hidden)</h2>
            <p style={{ color: '#6b7280', fontSize: '14px' }}>
              Payment links are managed by admin and sent to prospects directly.
            </p>
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
  mainContent: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', padding: '20px 40px', maxWidth: '1400px', margin: '0 auto' } as React.CSSProperties,
  column: { display: 'flex', flexDirection: 'column' as const, gap: '20px' } as React.CSSProperties,
  card: { backgroundColor: 'white', borderRadius: '8px', padding: '24px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' } as React.CSSProperties,
  cardDescription: { color: '#6b7280', fontSize: '14px', marginBottom: '20px' },
  error: { backgroundColor: '#fee2e2', color: '#dc2626', padding: '12px', borderRadius: '4px', marginBottom: '16px', fontSize: '14px' } as React.CSSProperties,
  form: { marginBottom: '20px' } as React.CSSProperties,
  formGroup: { marginBottom: '16px' } as React.CSSProperties,
  label: { display: 'block', marginBottom: '4px', fontWeight: 'bold' as const, color: '#374151', fontSize: '14px' },
  input: { width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box' as const } as React.CSSProperties,
  button: { width: '100%', padding: '10px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', fontSize: '14px', fontWeight: 'bold' as const, cursor: 'pointer' } as React.CSSProperties,
  demoResult: { backgroundColor: '#ecfdf5', border: '2px solid #10b981', borderRadius: '8px', padding: '20px' } as React.CSSProperties,
  demoTitle: { color: '#059669', marginTop: 0 },
  demoContent: { marginBottom: '16px' } as React.CSSProperties,
  demoLine: { display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' } as React.CSSProperties,
  demoLabel: { color: '#6b7280', fontWeight: 'bold' as const },
  demoValue: { color: '#1f2937' },
  phoneDisplay: { marginTop: '16px', marginBottom: '12px' } as React.CSSProperties,
  phoneLabel: { display: 'block', color: '#6b7280', fontSize: '12px', fontWeight: 'bold' as const, marginBottom: '4px' },
  phoneNumber: { fontSize: '24px', fontWeight: 'bold' as const, color: '#059669', fontFamily: 'monospace', padding: '12px', backgroundColor: 'white', borderRadius: '4px', textAlign: 'center' as const },
  demoNote: { color: '#6b7280', fontSize: '13px', fontStyle: 'italic', margin: '12px 0 0 0' },
  releaseBtn: { width: '100%', padding: '10px', backgroundColor: '#f97316', color: 'white', border: 'none', borderRadius: '4px', fontSize: '14px', fontWeight: 'bold' as const, cursor: 'pointer' } as React.CSSProperties,
  statusGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '16px' } as React.CSSProperties,
  statusItem: { textAlign: 'center' as const, padding: '12px', backgroundColor: '#f3f4f6', borderRadius: '4px' } as React.CSSProperties,
  statusNumber: { fontSize: '28px', fontWeight: 'bold' as const, color: '#1f2937' },
  statusLabel: { fontSize: '12px', color: '#6b7280', marginTop: '4px' },
  warning: { backgroundColor: '#fef3c7', color: '#92400e', padding: '12px', borderRadius: '4px', fontSize: '14px' } as React.CSSProperties,
  checklistItem: { display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '12px', borderBottom: '1px solid #e5e7eb', fontSize: '14px' } as React.CSSProperties,
  checkbox: { width: '18px', height: '18px', cursor: 'pointer' } as React.CSSProperties,
}
