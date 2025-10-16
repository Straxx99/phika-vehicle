import { supabase } from '@/lib/supabase'

export default async function TestDB() {
  // Test database connection
  const { data, error } = await supabase
    .from('leads')
    .select('count')
    .limit(1)

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Database Connection Test</h1>
      {error ? (
        <div className="text-red-600">
          ❌ Error: {error.message}
        </div>
      ) : (
        <div className="text-green-600">
          ✅ Database connected successfully!
        </div>
      )}
    </div>
  )
}