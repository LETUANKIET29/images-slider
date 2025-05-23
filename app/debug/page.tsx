"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function DebugPage() {
  const [testResult, setTestResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [page, setPage] = useState(1)

  async function testNeonConnection() {
    setLoading(true)
    try {
      const response = await fetch("/api/neon/test")
      const data = await response.json()
      setTestResult(data)
    } catch (error) {
      setTestResult({
        success: false,
        error: "Failed to fetch",
        details: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setLoading(false)
    }
  }

  async function testUsersAPI() {
    setLoading(true)
    try {
      const response = await fetch("/api/users")
      const data = await response.json()
      setTestResult(data)
    } catch (error) {
      setTestResult({
        success: false,
        error: "Failed to fetch users",
        details: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setLoading(false)
    }
  }

  async function testSearchUsers() {
    if (!searchQuery.trim()) return

    setLoading(true)
    try {
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(searchQuery)}`)
      const data = await response.json()
      setTestResult(data)
    } catch (error) {
      setTestResult({
        success: false,
        error: "Failed to search users",
        details: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setLoading(false)
    }
  }

  async function testPaginatedUsers() {
    setLoading(true)
    try {
      const response = await fetch(`/api/users/paginated?page=${page}&limit=5`)
      const data = await response.json()
      setTestResult(data)
    } catch (error) {
      setTestResult({
        success: false,
        error: "Failed to get paginated users",
        details: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setLoading(false)
    }
  }

  async function addSampleUser() {
    setLoading(true)
    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: `User ${Date.now()}`,
          email: `user${Date.now()}@example.com`,
        }),
      })
      const data = await response.json()
      setTestResult(data)
    } catch (error) {
      setTestResult({
        success: false,
        error: "Failed to add user",
        details: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Neon Database Debug</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Basic Tests</h2>
          <Button onClick={testNeonConnection} disabled={loading} className="w-full">
            {loading ? "Testing..." : "Test Neon Connection"}
          </Button>

          <Button onClick={testUsersAPI} disabled={loading} className="w-full">
            {loading ? "Testing..." : "Test Users API"}
          </Button>

          <Button onClick={addSampleUser} disabled={loading} className="w-full">
            {loading ? "Adding..." : "Add Sample User"}
          </Button>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Advanced Tests</h2>

          <div className="space-y-2">
            <Label htmlFor="search">Search Users</Label>
            <div className="flex space-x-2">
              <Input
                id="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter search query"
              />
              <Button onClick={testSearchUsers} disabled={loading || !searchQuery.trim()}>
                Search
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="page">Paginated Users</Label>
            <div className="flex space-x-2">
              <Input
                id="page"
                type="number"
                value={page}
                onChange={(e) => setPage(Number.parseInt(e.target.value) || 1)}
                placeholder="Page number"
                min="1"
              />
              <Button onClick={testPaginatedUsers} disabled={loading}>
                Get Page
              </Button>
            </div>
          </div>
        </div>
      </div>

      {testResult && (
        <div className="bg-gray-100 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Test Result:</h2>
          <pre className="text-sm overflow-auto max-h-96">{JSON.stringify(testResult, null, 2)}</pre>
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-2">Database Information:</h2>
        <div className="bg-gray-100 p-4 rounded-lg">
          <p>✅ Database: Neon PostgreSQL</p>
          <p>✅ Connection: Serverless with @neondatabase/serverless</p>
          <p>✅ Environment: DATABASE_URL is configured</p>
          <p>✅ Features: CRUD operations, search, pagination</p>
        </div>
      </div>
    </div>
  )
}
