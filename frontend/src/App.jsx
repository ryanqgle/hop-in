import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'
import { supabase } from './dbConnection'

function App() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event, session) =>{
      if (event === 'SIGNED_IN' && session){
        const email = session.user.email
        if (!email.endsWith('.edu')) {
          alert('Login with a valid .edu email')
          supabase.auth.signOut()
        } else {
          localStorage.setItem('supabaseToken', session.access_token)
        }
      }
    })
    return () => data.subscription.unsubscribe()
  }, [])

  const testBackendConn = async () => {
    const token = localStorage.getItem('supabaseToken')
    const res = await fetch('http://localhost:5000/api/test', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    const data = await res.json()
    console.log("Flask response: ", data)
    alert(data.message)
  }

  return (
    <>
      <button onClick={testBackendConn}>Test Flask Connection</button>
    </>
  )
}

export default App
