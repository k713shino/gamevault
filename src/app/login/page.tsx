import AuthForm from '@/components/AuthForm'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-100">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">GameVault ログイン</h1>
      <AuthForm mode="login" />
    </div>
  )
}
