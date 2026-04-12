import { Link } from 'react-router-dom'
import { firebaseConfigured } from '../services/firebase'
import { isCloudinaryConfigured } from '../services/cloudinaryService'

export function SetupPage() {
  if (firebaseConfigured && isCloudinaryConfigured()) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-emerald-200 bg-emerald-50 p-6 dark:border-emerald-900 dark:bg-emerald-950/40">
        <p className="font-medium text-emerald-900 dark:text-emerald-200">
          Firebase and Cloudinary environment variables are set.
        </p>
        <Link to="/login" className="mt-3 inline-block text-sm font-semibold text-indigo-600 dark:text-indigo-400">
          Go to login →
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl rounded-2xl border border-amber-200 bg-amber-50 p-8 dark:border-amber-900 dark:bg-amber-950/30">
      <h1 className="text-xl font-bold text-amber-950 dark:text-amber-100">Configure the app</h1>
      <p className="mt-2 text-sm text-amber-900/90 dark:text-amber-200/90">
        Create a <code className="rounded bg-amber-100 px-1 dark:bg-amber-900">.env</code> file in
        the project root by copying <code className="rounded bg-amber-100 px-1 dark:bg-amber-900">.env.example</code>. Add your Firebase web app keys (Project settings → Your apps) and your{' '}
        <strong>Cloudinary</strong> cloud name plus an <strong>unsigned upload preset</strong>.
      </p>
      <p className="mt-4 text-sm text-amber-900/90 dark:text-amber-200/90">
        Enable <strong>Google</strong> sign-in under Authentication → Sign-in method, create a{' '}
        <strong>Firestore</strong> database, and deploy <code className="rounded bg-amber-100 px-1 dark:bg-amber-900">firestore.rules</code> (see{' '}
        <code className="rounded bg-amber-100 px-1 dark:bg-amber-900">README.md</code>). File uploads use Cloudinary only — Firebase Storage is not required.
      </p>
    </div>
  )
}
