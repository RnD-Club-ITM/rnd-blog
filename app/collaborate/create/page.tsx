'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { Navigation } from '@/components/layout/Navigation'
import { Button } from '@/components/retroui/Button'
import { Card } from '@/components/retroui/Card'
import { Rocket } from 'lucide-react'
import { toast } from 'sonner'

export default function CreateProjectPage() {
  const router = useRouter()
  const { user, isLoaded } = useUser()
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    projectName: '',
    description: '',
    skillsNeeded: '',
    duration: '1-2 months',
    commitment: '5-10 hours/week',
    maxPositions: 3
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      toast.error('Please sign in to post a project')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/collaborate/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!res.ok) throw new Error('Failed to create project')

      toast.success('Project posted successfully!')
      router.push('/collaborate')
      router.refresh()
    } catch (error) {
      console.error(error)
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (!isLoaded) return null

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-background py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <Button
            variant="ghost"
            className="mb-8"
            onClick={() => router.back()}
          >
            ← Back to Projects
          </Button>

          <Card className="p-8 border-brutal shadow-brutal bg-card">
            <h1 className="font-head text-3xl font-bold mb-6">Post a New Project</h1>
            <p className="text-muted-foreground mb-8">
              Find collaborators to build your next big idea with.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block font-bold mb-2">Project Name</label>
                <input
                  required
                  type="text"
                  className="w-full p-3 border-2 border-black rounded-lg focus:shadow-brutal-sm outline-none transition-all bg-background"
                  placeholder="e.g. AI-Powered Study Assistant"
                  value={formData.projectName}
                  onChange={e => setFormData({ ...formData, projectName: e.target.value })}
                />
              </div>

              <div>
                <label className="block font-bold mb-2">Description</label>
                <textarea
                  required
                  rows={5}
                  className="w-full p-3 border-2 border-black rounded-lg focus:shadow-brutal-sm outline-none transition-all bg-background"
                  placeholder="What are you building? What problem does it solve?"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div>
                <label className="block font-bold mb-2">Skills Needed (comma separated)</label>
                <input
                  type="text"
                  className="w-full p-3 border-2 border-black rounded-lg focus:shadow-brutal-sm outline-none transition-all bg-background"
                  placeholder="React, Python, Design, etc."
                  value={formData.skillsNeeded}
                  onChange={e => setFormData({ ...formData, skillsNeeded: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block font-bold mb-2">Duration</label>
                  <select
                    className="w-full p-3 border-2 border-black rounded-lg focus:shadow-brutal-sm outline-none transition-all bg-background"
                    value={formData.duration}
                    onChange={e => setFormData({ ...formData, duration: e.target.value })}
                  >
                    <option>1-2 weeks</option>
                    <option>3-4 weeks</option>
                    <option>1-2 months</option>
                    <option>3+ months</option>
                  </select>
                </div>

              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block font-bold mb-2">Weekly Commitment</label>
                  <input
                    type="text"
                    className="w-full p-3 border-2 border-black rounded-lg focus:shadow-brutal-sm outline-none transition-all bg-background"
                    placeholder="e.g. 5-10 hours"
                    value={formData.commitment}
                    onChange={e => setFormData({ ...formData, commitment: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block font-bold mb-2">Number of People (Max Entries)</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    className="w-full p-3 border-2 border-black rounded-lg focus:shadow-brutal-sm outline-none transition-all bg-background"
                    value={formData.maxPositions}
                    onChange={e => setFormData({ ...formData, maxPositions: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full py-4 text-lg font-bold border-brutal shadow-brutal hover:shadow-brutal-sm bg-primary text-primary-foreground"
              >
                {loading ? 'Posting...' : (
                  <span className="flex items-center gap-2">Post Project <Rocket className="w-5 h-5" /></span>
                )}
              </Button>
            </form>
          </Card>
        </div>
      </main>
    </>
  )
}
