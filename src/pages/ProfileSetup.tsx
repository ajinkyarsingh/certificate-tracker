import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { doc, updateDoc } from 'firebase/firestore'
import { requireDb } from '../services/firebase'

export default function ProfileSetup() {
  const { user } = useAuth()

  const [name, setName] = useState('')
  const [usn, setUsn] = useState('')
  const [joinYear, setJoinYear] = useState('')
  const [branch, setBranch] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    if (!user) return

    if (!name || !usn || !joinYear || !branch) {
      alert('Fill all fields')
      return
    }

    try {
      setLoading(true)

      const db = requireDb()
      await updateDoc(doc(db, 'users', user.uid), {
        name,
        usn,
        joinYear: Number(joinYear),
        branch,
      })

      window.location.reload()
    } catch {
      alert('Error saving')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <div className="w-full max-w-md bg-white/5 p-6 rounded-2xl">

        <h2 className="text-xl mb-4 text-center">Complete Profile</h2>

        <input
          placeholder="Name"
          className="w-full mb-3 p-2 bg-black/40 rounded"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          placeholder="USN"
          className="w-full mb-3 p-2 bg-black/40 rounded"
          value={usn}
          onChange={(e) => setUsn(e.target.value)}
        />

        {/* JOIN YEAR */}
        <select
          value={joinYear}
          onChange={(e) => setJoinYear(e.target.value)}
          className="w-full mb-3 p-2 bg-black/40 rounded"
        >
          <option value="">Select Joining Year</option>
          <option>2022</option>
          <option>2023</option>
          <option>2024</option>
          <option>2025</option>
        </select>

        {/* BRANCH */}
        <select
          value={branch}
          onChange={(e) => setBranch(e.target.value)}
          className="w-full mb-4 p-2 bg-black/40 rounded"
        >
          <option value="">Select Branch</option>
          <option>CSE</option>
          <option>CSE(AIML)</option>
          <option>EEE</option>
          <option>ECE</option>
          <option>MECH</option>
          <option>CIVIL</option>
          <option>IS</option>
          <option>ARCH</option>
        </select>

        <button
          onClick={handleSave}
          className="w-full bg-purple-600 py-2 rounded"
        >
          {loading ? 'Saving...' : 'Continue'}
        </button>

      </div>
    </div>
  )
}