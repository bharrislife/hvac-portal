import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getAvailablePhone, updatePhoneInfo } from '@/lib/kv'

async function updateVapiAssistant(companyName: string) {
  try {
    const apiKey = process.env.VAPI_API_KEY
    const assistantId = process.env.VAPI_ASSISTANT_ID

    if (!apiKey || !assistantId) {
      console.warn('VAPI_API_KEY or VAPI_ASSISTANT_ID not set, skipping prompt update')
      return
    }

    // Fetch current assistant to get existing system prompt
    const getResponse = await fetch(`https://api.vapi.ai/assistant/${assistantId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    })

    if (!getResponse.ok) {
      console.error('Failed to fetch assistant:', getResponse.statusText)
      return
    }

    const assistant = await getResponse.json()
    let systemPrompt = assistant.model?.systemPrompt || ''

    // Inject company name into the prompt
    // Replace the company name placeholder or add it if not present
    if (systemPrompt.includes('{{companyName}}')) {
      systemPrompt = systemPrompt.replace('{{companyName}}', companyName)
    } else {
      // Prepend company name to the prompt if no placeholder exists
      systemPrompt = `You are a voice agent for ${companyName}. ${systemPrompt}`
    }

    // Update the assistant with the new system prompt
    const updateResponse = await fetch(`https://api.vapi.ai/assistant/${assistantId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: {
          ...assistant.model,
          systemPrompt: systemPrompt,
        },
      }),
    })

    if (!updateResponse.ok) {
      console.error('Failed to update Vapi assistant:', updateResponse.statusText)
      return
    }

    console.log(`Successfully updated Vapi prompt for ${companyName}`)
  } catch (error) {
    console.error('Error updating Vapi assistant:', error)
    // Don't throw - allow demo to proceed even if Vapi update fails
  }
}

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const { prospectName, areaCode } = await request.json()
    if (!prospectName || !areaCode) {
      return NextResponse.json({ error: 'Prospect name and area code required' }, { status: 400 })
    }
    const phone = await getAvailablePhone(session.email)
    if (!phone) {
      return NextResponse.json({ error: 'No available demo numbers at this time' }, { status: 503 })
    }
    
    await updatePhoneInfo(phone.id, prospectName, areaCode)
    
    // Call Vapi API to update assistant prompt with company name
    await updateVapiAssistant(prospectName)

    return NextResponse.json({
      success: true,
      phoneNumber: phone.number,
      phoneId: phone.id,
      prospectName,
      areaCode,
      message: `Demo phone ready for ${prospectName}. Script has been customized with prospect name.`,
    }, { status: 200 })
  } catch (error) {
    console.error('Get demo error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
