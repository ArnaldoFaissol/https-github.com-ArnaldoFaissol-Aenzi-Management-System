import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import pb from '@/lib/pocketbase/client'

interface AuthContextType {
  user: any
  session: any
  signUp: (data: {
    name: string
    email: string
    password: string
    passwordConfirm: string
  }) => Promise<{ error: any }>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<{ error: any }>
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(pb.authStore.record)
  const [session, setSession] = useState<any>(
    pb.authStore.token ? { access_token: pb.authStore.token } : null,
  )
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setUser(pb.authStore.record)
    setSession(pb.authStore.token ? { access_token: pb.authStore.token } : null)

    const unsubscribe = pb.authStore.onChange((token, record) => {
      setUser(record)
      setSession(token ? { access_token: token } : null)
    })

    setLoading(false)

    return () => {
      unsubscribe()
    }
  }, [])

  const signUp = async (data: {
    name: string
    email: string
    password: string
    passwordConfirm: string
  }) => {
    try {
      await pb.collection('users').create({ ...data, role: 'user' })
      await pb.collection('users').authWithPassword(data.email, data.password)
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      await pb.collection('users').authWithPassword(email, password)
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const signOut = async () => {
    pb.authStore.clear()
    return { error: null }
  }

  return (
    <AuthContext.Provider value={{ user, session, signUp, signIn, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  )
}
