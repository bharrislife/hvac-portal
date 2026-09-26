import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getPoolStatus } from '@/lib/kv'

export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const poolStatus = await getPoolStatus()
    const stats = {
      available: poolStatus.filter((p) => p.status === 'available').length,
      inUse: poolStatus.filter((p) => p.status === 'in-use').length,
      permanent: poolStatus.filter((p) => p.status === 'permanent').length,
      total: poolStatus.length,
    }
    return NextResponse.json({ success: true, stats, pool: poolStatus }, { status: 200 })
  } catch (error) {
    console.error('Pool status error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
