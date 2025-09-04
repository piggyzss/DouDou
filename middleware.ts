import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { v4 as uuidv4 } from 'uuid'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const cookie = request.cookies.get('anon_id')?.value
  if (!cookie) {
    const id = uuidv4()
    response.cookies.set('anon_id', id, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 365
    })
  }
  return response
}

export const config = {
  matcher: ['/((?!_next|favicon.ico|icon.svg|.*\.(?:png|jpg|jpeg|gif|webp|svg)).*)']
}
