import AuthForm from '@/components/AuthForm'
import Link from 'next/link'

export default function SignupPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-100">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">GameVault 新規登録</h1>
      <AuthForm mode="signup" />
      <p className="mt-4 text-sm text-gray-700">
        既にアカウントをお持ちの方は
        <Link href="/login" className="text-blue-600 hover:underline ml-1 font-medium">
          ログイン
        </Link>
      </p>
    </div>
  )
}