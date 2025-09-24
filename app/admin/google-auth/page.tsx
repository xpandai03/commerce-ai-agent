'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, ExternalLink, AlertCircle } from "lucide-react"
import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"

export default function GoogleAuthPage() {
  const searchParams = useSearchParams()
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const success = searchParams.get('success')
  const error = searchParams.get('error')

  // Build the auth URL directly
  const clientId = "106395938371-grvgpir70orlg29e91va576d4pfcc429.apps.googleusercontent.com"
  const redirectUri = "http://localhost:3000/api/auth/google/callback"
  const scope = "https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/drive.file"

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${clientId}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `response_type=code&` +
    `scope=${encodeURIComponent(scope)}&` +
    `access_type=offline&` +
    `prompt=consent`

  useEffect(() => {
    // Check authentication status
    fetch('/api/drive/test')
      .then(res => res.json())
      .then(data => {
        setIsAuthenticated(data.status?.authenticated || false)
      })
  }, [success])

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Google Drive Authentication</CardTitle>
            <CardDescription>
              Connect your Google account to sync knowledge base from Google Drive
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  {error === 'auth_denied' && 'Authorization was denied. Please try again.'}
                  {error === 'auth_failed' && 'Authentication failed. Please try again.'}
                  {error === 'no_code' && 'No authorization code received. Please try again.'}
                </AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Successfully connected to Google Drive! Check your terminal for the refresh token.
                </AlertDescription>
              </Alert>
            )}

            {isAuthenticated ? (
              <div className="space-y-4">
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    You are already authenticated with Google Drive!
                  </AlertDescription>
                </Alert>
                <Button
                  onClick={() => window.location.href = '/admin/knowledge'}
                  className="w-full"
                >
                  Go to Knowledge Base
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-gray-100 rounded-lg">
                  <h3 className="font-semibold mb-2">Steps to authenticate:</h3>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                    <li>Click the button below to authorize with Google</li>
                    <li>Sign in with your Google account</li>
                    <li>Grant access to Google Drive</li>
                    <li>You'll be redirected back here</li>
                    <li>Check your terminal for the refresh token</li>
                  </ol>
                </div>

                <Button
                  onClick={() => window.location.href = authUrl}
                  className="w-full gap-2"
                  size="lg"
                >
                  <ExternalLink className="h-4 w-4" />
                  Authorize with Google Drive
                </Button>

                <div className="text-xs text-gray-500 text-center">
                  You may see an "unverified app" warning - this is normal for development
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {success && (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Final Step: Add Refresh Token</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-2">
                Check your terminal for a message like:
              </p>
              <pre className="bg-gray-900 text-green-400 p-3 rounded text-xs">
                === GOOGLE AUTHENTICATION SUCCESS ===
                Add this to your .env.local file:
                GOOGLE_REFRESH_TOKEN=1//...
              </pre>
              <p className="text-sm text-gray-600 mt-2">
                Copy the refresh token and add it to your .env.local file, then restart the server.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}