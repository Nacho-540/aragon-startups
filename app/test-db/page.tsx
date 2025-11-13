import { createClient } from '@/lib/supabase/server'

export default async function TestDbPage() {
  const supabase = await createClient()

  try {
    // Test 1: Simple count
    const { count: totalCount, error: countError } = await supabase
      .from('startups')
      .select('*', { count: 'exact', head: true })

    // Test 2: Get approved startups
    const { data: approvedStartups, error: approvedError, count: approvedCount } = await supabase
      .from('startups')
      .select('*', { count: 'exact' })
      .eq('is_approved', true)
      .limit(5)

    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Database Connection Test</h1>

        <div className="space-y-6">
          {/* Test 1 Results */}
          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Test 1: Total Startups Count</h2>
            {countError ? (
              <div className="bg-red-50 border border-red-200 rounded p-4">
                <p className="font-semibold text-red-900">Error:</p>
                <pre className="text-sm mt-2 text-red-800 whitespace-pre-wrap">
                  {JSON.stringify(countError, null, 2)}
                </pre>
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded p-4">
                <p className="text-green-900">
                  <span className="font-semibold">Success!</span> Total startups: {totalCount}
                </p>
              </div>
            )}
          </div>

          {/* Test 2 Results */}
          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Test 2: Approved Startups</h2>
            {approvedError ? (
              <div className="bg-red-50 border border-red-200 rounded p-4">
                <p className="font-semibold text-red-900">Error:</p>
                <pre className="text-sm mt-2 text-red-800 whitespace-pre-wrap">
                  {JSON.stringify(approvedError, null, 2)}
                </pre>
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded p-4">
                <p className="text-green-900 mb-4">
                  <span className="font-semibold">Success!</span> Approved startups: {approvedCount}
                </p>
                {approvedStartups && approvedStartups.length > 0 && (
                  <div className="mt-4">
                    <p className="font-semibold mb-2">Sample data:</p>
                    <ul className="space-y-2">
                      {approvedStartups.map((startup: any) => (
                        <li key={startup.id} className="text-sm">
                          <span className="font-medium">{startup.nombre}</span>
                          {' - '}
                          <span className="text-gray-600">{startup.ubicacion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Environment Check */}
          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Environment Variables</h2>
            <div className="space-y-2 text-sm">
              <p>
                NEXT_PUBLIC_SUPABASE_URL: {' '}
                <span className={process.env.NEXT_PUBLIC_SUPABASE_URL ? 'text-green-600' : 'text-red-600'}>
                  {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing'}
                </span>
              </p>
              <p>
                NEXT_PUBLIC_SUPABASE_ANON_KEY: {' '}
                <span className={process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'text-green-600' : 'text-red-600'}>
                  {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set (hidden)' : '❌ Missing'}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Database Connection Test</h1>
        <div className="bg-red-50 border border-red-200 rounded p-6">
          <p className="font-semibold text-red-900 mb-2">Unexpected Error:</p>
          <pre className="text-sm text-red-800 whitespace-pre-wrap">
            {error instanceof Error ? error.message : JSON.stringify(error, null, 2)}
          </pre>
        </div>
      </div>
    )
  }
}
