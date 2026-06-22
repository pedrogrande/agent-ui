import { NextRequest, NextResponse } from 'next/server'

// Dynamic API proxy — avoids CORS issues when Agent-UI and AgentOS are on
// different Coder subdomains. The browser calls /api/proxy/* on the same
// origin as Agent-UI, and this route forwards the request to the AgentOS API.
//
// The AgentOS URL is determined at runtime:
// 1. If the request has an X-AgentOS-URL header (set by the client), use it
// 2. If accessed via Coder subdomain, replace 'agent-ui' with 'agentos' in the host
// 3. Default to http://localhost:8000 for SSH tunnel access

function getAgentOsUrl(req: NextRequest): string {
  // Check for custom header (client can override)
  const headerUrl = req.headers.get('x-agentos-url')
  if (headerUrl) return headerUrl.replace(/\/$/, '')

  // Check the host header — if it's a Coder subdomain, derive the AgentOS URL
  const host = req.headers.get('host') || ''
  if (host.includes('--') && host.includes('agent-ui')) {
    const protocol = req.nextUrl.protocol || 'http:'
    const agentosHost = host.replace('agent-ui', 'agentos')
    return `${protocol}//${agentosHost}`
  }

  // Default for localhost / SSH tunnel
  return 'http://localhost:8000'
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params
  const agentOsUrl = getAgentOsUrl(req)
  const searchParams = req.nextUrl.searchParams.toString()
  const targetUrl = `${agentOsUrl}/${path.join('/')}${searchParams ? '?' + searchParams : ''}`

  try {
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        ...(req.headers.get('authorization') && {
          'Authorization': req.headers.get('authorization')!,
        }),
      },
    })
    const data = await response.text()
    return new NextResponse(data, {
      status: response.status,
      headers: { 'Content-Type': response.headers.get('content-type') || 'application/json' },
    })
  } catch {
    return NextResponse.json({ error: 'Failed to reach AgentOS API' }, { status: 502 })
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params
  const agentOsUrl = getAgentOsUrl(req)
  const searchParams = req.nextUrl.searchParams.toString()
  const targetUrl = `${agentOsUrl}/${path.join('/')}${searchParams ? '?' + searchParams : ''}`

  const contentType = req.headers.get('content-type') || ''
  const isFormData = contentType.includes('multipart/form-data')

  try {
    const body = isFormData ? await req.formData() : await req.text()
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: isFormData
        ? {
            ...(req.headers.get('authorization') && {
              'Authorization': req.headers.get('authorization')!,
            }),
          }
        : {
            'Content-Type': contentType || 'application/json',
            'Accept': 'application/json',
            ...(req.headers.get('authorization') && {
              'Authorization': req.headers.get('authorization')!,
            }),
          },
      body: body as BodyInit,
    })
    const data = await response.text()
    return new NextResponse(data, {
      status: response.status,
      headers: { 'Content-Type': response.headers.get('content-type') || 'application/json' },
    })
  } catch {
    return NextResponse.json({ error: 'Failed to reach AgentOS API' }, { status: 502 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params
  const agentOsUrl = getAgentOsUrl(req)
  const searchParams = req.nextUrl.searchParams.toString()
  const targetUrl = `${agentOsUrl}/${path.join('/')}${searchParams ? '?' + searchParams : ''}`

  try {
    const body = await req.text()
    const response = await fetch(targetUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': req.headers.get('content-type') || 'application/json',
        'Accept': 'application/json',
        ...(req.headers.get('authorization') && {
          'Authorization': req.headers.get('authorization')!,
        }),
      },
      body,
    })
    const data = await response.text()
    return new NextResponse(data, {
      status: response.status,
      headers: { 'Content-Type': response.headers.get('content-type') || 'application/json' },
    })
  } catch {
    return NextResponse.json({ error: 'Failed to reach AgentOS API' }, { status: 502 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params
  const agentOsUrl = getAgentOsUrl(req)
  const searchParams = req.nextUrl.searchParams.toString()
  const targetUrl = `${agentOsUrl}/${path.join('/')}${searchParams ? '?' + searchParams : ''}`

  try {
    const response = await fetch(targetUrl, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        ...(req.headers.get('authorization') && {
          'Authorization': req.headers.get('authorization')!,
        }),
      },
    })
    const data = await response.text()
    return new NextResponse(data, {
      status: response.status,
      headers: { 'Content-Type': response.headers.get('content-type') || 'application/json' },
    })
  } catch {
    return NextResponse.json({ error: 'Failed to reach AgentOS API' }, { status: 502 })
  }
}