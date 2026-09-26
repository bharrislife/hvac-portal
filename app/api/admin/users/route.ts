import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { createUser, getAllUsers, deleteUser, getUser } from '@/lib/kv'

export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const users = await getAllUsers()
    return NextResponse.json({ success: true, users }, { status: 200 })
  } catch (error) {
    console.error('Get users error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const { email, role } = await request.json()
    if (!email || !role) {
      return NextResponse.json({ error: 'Email and role required' }, { status: 400 })
    }
    if (role !== 'admin' && role !== 'sales') {
      return NextResponse.json({ error: 'Role must be admin or sales' }, { status: 400 })
    }
    const existing = await getUser(email)
    if (existing) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 })
    }
    const user = await createUser(email, role)
    return NextResponse.json({
      success: true,
      user,
      defaultPassword: role === 'sales' ? 'sales123' : 'use master admin password',
    }, { status: 201 })
  } catch (error) {
    console.error('Create user error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const { email } = await request.json()
    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 })
    }
    const users = await getAllUsers()
    const adminCount = users.filter((u: any) => u.role === 'admin').length
    const userToDelete = await getUser(email)
    if (userToDelete?.role === 'admin' && adminCount <= 1) {
      return NextResponse.json({ error: 'Cannot delete the last admin user' }, { status: 400 })
    }
    await deleteUser(email)
    return NextResponse.json({ success: true, message: 'User deleted' }, { status: 200 })
  } catch (error) {
    console.error('Delete user error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
