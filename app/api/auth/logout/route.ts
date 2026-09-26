import { NextRequest, NextResponse } from 'next/server'
import { deleteSession, getSession } from '@/lib/auth'

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'No active session' }, { status: 401 })
  }
  await deleteSession()
  return NextResponse.json({ success: true, message: 'Logged out successfully' }, { status: 200 })
}
