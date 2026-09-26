import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { releasePhone } from '@/lib/kv'

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const { phoneId } = await request.json()
    if (!phoneId) {
      return NextResponse.json({ error: 'Phone ID required' }, { status: 400 })
    }
    await releasePhone(phoneId)
    return NextResponse.json({ success: true, message: 'Demo number released back to pool' }, { status: 200 })
  } catch (error) {
    console.error('Release demo error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
