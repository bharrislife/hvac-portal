import { NextRequest, NextResponse } from 'next/server'
import { createSession } from '@/lib/auth'
import { getUser } from '@/lib/kv'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    }
    const user = await getUser(email)
    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }
    if (user.role === 'admin') {
      if (password !== process.env.ADMIN_PASSWORD) {
        return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
      }
    } else {
      if (password !== 'sales123') {
        return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
      }
    }
    await createSession(email, user.role)
    return NextResponse.json({ success: true, email: user.email, role: user.role }, { status: 200 })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
