import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function App() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  // Check for existing session on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async () => {
    setLoading(true)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    setLoading(false)
    if (error) {
      alert(error.message)
    } else {
      alert('Check your email for the confirmation link!')
    }
  }

  const signIn = async () => {
    setLoading(true)
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    setLoading(false)
    if (error) {
      alert(error.message)
    } else {
      alert('Signed in successfully!')
    }
  }

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    })
    if (error) alert(error.message)
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    alert('Signed out!')
  }

//   const callProtected = async () => {
//     const session = await supabase.auth.getSession()
//     const token = session.data.session?.access_token
// console.log(token, 'token')
//     if (!token) {
//       alert('You need to sign in first!')
//       return
//     }
//
//     try {
//       const res = await fetch('http://localhost:8000/protected', {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       })
//
//       if (!res.ok) {
//         throw new Error('API call failed')
//       }
//
//       const data = await res.json()
//       alert(JSON.stringify(data, null, 2))
//     } catch (error) {
//       alert('Error calling API: ' + error)
//     }
//   }

const callProtected = async () => {
  console.log('=== Starting callProtected ===')

  const { data: { session }, error } = await supabase.auth.getSession()

  if (error) {
    console.error('Session error:', error)
    alert('Error getting session: ' + error.message)
    return
  }

  if (!session) {
    alert('No session found. Please sign in first!')
    return
  }

  const token = session.access_token

  // Log token details for debugging
  console.log('Token length:', token?.length)
  console.log('Token first 50 chars:', token?.substring(0, 50))
  console.log('Token parts:', token?.split('.').length)

  if (!token) {
    alert('No access token found!')
    return
  }

  try {
    console.log('Making fetch request to http://localhost:8000/protected')

    const res = await fetch('http://localhost:8000/protected', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    console.log('Response status:', res.status)
    const data = await res.json()
    console.log('Response data:', data)

    if (!res.ok) {
      alert('Error ' + res.status + ': ' + (data.detail || JSON.stringify(data)))
      return
    }

    alert('Success!\n\n' + JSON.stringify(data, null, 2))
  } catch (error) {
    console.error('Fetch error:', error)
    alert('Error calling API: ' + error)
  }
}

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-96 bg-white p-8 rounded-lg shadow-md space-y-4">
        <h1 className="text-2xl font-bold text-center">Authentication Demo</h1>

        {user ? (
          <div className="space-y-3">
            <p className="text-green-600">Signed in as: {user.email}</p>
            <button onClick={callProtected} className="btn w-full bg-blue-500 text-white p-2 rounded">
              Call Protected API
            </button>
            <button onClick={signOut} className="btn w-full bg-red-500 text-white p-2 rounded">
              Sign Out
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <input
              className="border p-2 w-full rounded"
              placeholder="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <input
              className="border p-2 w-full rounded"
              type="password"
              placeholder="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />

            <button
              onClick={signUp}
              disabled={loading}
              className="btn w-full bg-green-500 text-white p-2 rounded disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Sign Up'}
            </button>
            <button
              onClick={signIn}
              disabled={loading}
              className="btn w-full bg-blue-500 text-white p-2 rounded disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Login'}
            </button>
            <button
              onClick={signInWithGoogle}
              className="btn w-full bg-white border border-gray-300 p-2 rounded flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign in with Google
            </button>
          </div>
        )}
      </div>
    </div>
  )
}