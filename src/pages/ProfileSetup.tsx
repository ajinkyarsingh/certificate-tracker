import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { doc, updateDoc } from 'firebase/firestore'
import { requireDb } from '../services/firebase'

export default function ProfileSetup() {
  const { user } = useAuth()

  const [name, setName] = useState('')
  const [usn, setUsn] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    if (!user) return

    if (!name || !usn) {
      alert('Please fill all fields')
      return
    }

    try {
      setLoading(true)

      const db = requireDb()
      await updateDoc(doc(db, 'users', user.uid), {
        name,
        usn,
      })

      // reload app after saving
      window.location.reload()

    } catch (err) {
      console.error(err)
      alert('Error saving profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <div className="w-full max-w-md bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-6">
        
        <h2 className="text-xl font-semibold mb-4 text-center">
          Complete your profile
        </h2>

        <input
          type="text"
          placeholder="Full Name"
          className="w-full mb-3 p-2 rounded bg-black/40 outline-none"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="text"
          placeholder="USN"
          className="w-full mb-4 p-2 rounded bg-black/40 outline-none"
          value={usn}
          onChange={(e) => setUsn(e.target.value)}
        />

        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 py-2 rounded-xl"
        >
          {loading ? 'Saving...' : 'Continue'}
        </button>

      </div>
    </div>
  )
}