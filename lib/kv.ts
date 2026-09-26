interface PhonePoolItem {
  id: string
  number: string
  status: 'available' | 'in-use' | 'permanent'
  assignedTo?: string
  prospectName?: string
  areaCode?: string
  createdAt: string
}

let phonePoolStore: { [key: string]: PhonePoolItem } = {}
let usersStore: { [key: string]: any } = {}

const VAPI_PHONE_NUMBERS = [
  { id: '7061e1a1-02a7-4cd9-8840-ecec94c8a104', number: '+1 (708) 550 2484' },
  { id: '9c8c000b-00a0-4457-b9e4-91ec4b15de74', number: '+1 (708) 523 1445' },
  { id: '217767f1-948a-405c-83c6-bcfef0d40e61', number: '+1 (608) 883 4849' },
  { id: '8742f738-ebc0-47f8-8363-57c1be2cada0', number: '+1 (234) 348 8323' },
  { id: 'bd4b4ac9-b2ee-4d96-805c-27107f67ccf7', number: '+1 (307) 840 8036' },
]

export function initializePhonePool() {
  VAPI_PHONE_NUMBERS.forEach((phone) => {
    phonePoolStore[`phone:${phone.id}`] = {
      id: phone.id,
      number: phone.number,
      status: 'available',
      createdAt: new Date().toISOString(),
    }
  })
}

export async function getAvailablePhone(email: string): Promise<PhonePoolItem | null> {
  const availablePhones = Object.values(phonePoolStore).filter(
    (p) => p.status === 'available'
  )
  if (availablePhones.length === 0) return null
  const phone = availablePhones[0]
  phone.status = 'in-use'
  phone.assignedTo = email
  phonePoolStore[`phone:${phone.id}`] = phone
  return phone
}

export async function releasePhone(phoneId: string) {
  const key = `phone:${phoneId}`
  if (phonePoolStore[key]) {
    phonePoolStore[key].status = 'available'
    phonePoolStore[key].assignedTo = undefined
    phonePoolStore[key].prospectName = undefined
    phonePoolStore[key].areaCode = undefined
  }
}

export async function lockPhone(phoneId: string, customerEmail: string) {
  const key = `phone:${phoneId}`
  if (phonePoolStore[key]) {
    phonePoolStore[key].status = 'permanent'
    phonePoolStore[key].assignedTo = customerEmail
  }
}

export async function getPoolStatus() {
  return Object.values(phonePoolStore)
}

export async function updatePhoneInfo(phoneId: string, prospectName: string, areaCode: string) {
  const key = `phone:${phoneId}`
  if (phonePoolStore[key]) {
    phonePoolStore[key].prospectName = prospectName
    phonePoolStore[key].areaCode = areaCode
  }
}

export async function createUser(email: string, role: 'admin' | 'sales') {
  usersStore[email] = { email, role, createdAt: new Date().toISOString() }
  return usersStore[email]
}

export async function getUser(email: string) {
  return usersStore[email] || null
}

export async function getAllUsers() {
  return Object.values(usersStore)
}

export async function deleteUser(email: string) {
  delete usersStore[email]
}

export function initializeUsers() {
  createUser('admin@hvac.local', 'admin')
}

if (typeof window === 'undefined') {
  initializePhonePool()
  initializeUsers()
}
