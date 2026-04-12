import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase } from '@/lib/supabase/client'

export interface UserProfile {
  id: string
  email: string
  name: string
  avatar: string | null
  role: 'superuser' | 'admin' | 'user'
}

interface AuthContextType {
  user: UserProfile | null
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
  const [user, setUser] = useState<UserProfile | null>(null)
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      setLoading(true)
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setSession(session)
      if (session?.user) {
        await fetchProfile(session.user)
      } else {
        setUser(null)
      }
      setLoading(false)
    }

    initAuth()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session)
      if (session?.user) {
        setLoading(true)
        await fetchProfile(session.user)
        setLoading(false)
      } else {
        setUser(null)
        setLoading(false)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const fetchProfile = async (sessionUser: any) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', sessionUser.id)
        .single()

      if (data && !error) {
        setUser(data as UserProfile)
        return
      }

      if (error && error.code === 'PGRST116') {
        const newProfile = {
          id: sessionUser.id,
          email: sessionUser.email,
          name: sessionUser.user_metadata?.name || sessionUser.email?.split('@')[0] || 'User',
          role: 'user',
        }

        const { data: createdData, error: createError } = await supabase
          .from('users')
          .insert([newProfile])
          .select()
          .single()

        if (createdData && !createError) {
          setUser(createdData as UserProfile)
          return
        }

        // Handle race conditions (duplicate key error)
        if (createError && createError.code === '23505') {
          const { data: retryData, error: retryError } = await supabase
            .from('users')
            .select('*')
            .eq('id', sessionUser.id)
            .single()
          if (retryData && !retryError) {
            setUser(retryData as UserProfile)
            return
          }
        }
      }

      setUser(null)
    } catch (err) {
      setUser(null)
    }
  }

  const signUp = async (data: {
    name: string
    email: string
    password: string
    passwordConfirm: string
  }) => {
    try {
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
            role: 'user',
          },
        },
      })
      return { error }
    } catch (error) {
      return { error }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      return { error }
    } catch (error) {
      return { error }
    }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    setUser(null)
    setSession(null)
    return { error }
  }

  return (
    <AuthContext.Provider value={{ user, session, signUp, signIn, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  )
}
