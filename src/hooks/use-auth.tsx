import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import pb from '@/lib/pocketbase/client'
import type { RecordModel } from 'pocketbase'

export interface UserProfile extends RecordModel {
  id: string
  email: string
  name: string
  avatar: string
  role: 'superuser' | 'admin' | 'user'
}

interface AuthContextType {
  user: UserProfile | null
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
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const initAuth = async () => {
      setLoading(true)

      if (pb.authStore.isValid && pb.authStore.record) {
        try {
          // Verify session by refreshing token
          const authData = await pb.collection('users').authRefresh()

          if (isMounted) {
            let currentUser = authData.record as UserProfile

            // Auto-assign default role if missing for profile integrity
            if (!currentUser.role) {
              try {
                const updated = await pb
                  .collection('users')
                  .update(currentUser.id, { role: 'user' })
                currentUser = updated as UserProfile
              } catch (e) {
                console.error('Failed to assign default role:', e)
              }
            }

            setUser(currentUser)
          }
        } catch (err) {
          // Error handling: if invalid or expired, clear local state completely
          if (isMounted) {
            pb.authStore.clear()
            setUser(null)
          }
        }
      } else {
        if (isMounted) {
          pb.authStore.clear()
          setUser(null)
        }
      }

      if (isMounted) {
        setLoading(false)
      }
    }

    initAuth()

    const unsubscribe = pb.authStore.onChange(async (_token, record) => {
      if (!isMounted) return

      if (record) {
        let currentUser = record as UserProfile

        if (!currentUser.role) {
          try {
            const updated = await pb.collection('users').update(currentUser.id, { role: 'user' })
            currentUser = updated as UserProfile
          } catch (e) {
            console.error('Failed to assign default role:', e)
          }
        }

        setUser(currentUser)
      } else {
        setUser(null)
      }

      setLoading(false)
    })

    return () => {
      isMounted = false
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
      setLoading(true)
      await pb.collection('users').create({
        email: data.email,
        password: data.password,
        passwordConfirm: data.passwordConfirm,
        name: data.name,
        role: 'user', // Default value on registration
      })
      await pb.collection('users').authWithPassword(data.email, data.password)
      return { error: null }
    } catch (error) {
      setLoading(false)
      return { error }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      await pb.collection('users').authWithPassword(email, password)
      return { error: null }
    } catch (error) {
      setLoading(false)
      return { error }
    }
  }

  const signOut = async () => {
    try {
      pb.authStore.clear()
      setUser(null)
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  return (
    <AuthContext.Provider value={{ user, signUp, signIn, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  )
}
