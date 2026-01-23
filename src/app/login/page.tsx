import AuthForm from '@/components/AuthForm'
import Link from 'next/link'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-100">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">GameVault ログイン</h1>
      <AuthForm mode="login" />
      <p className="mt-4 text-sm text-gray-700">
        アカウントをお持ちでない方は
        <Link href="/signup" className="text-blue-600 hover:underline ml-1 font-medium">
          新規登録
        </Link>
      </p>
    </div>
  )
}