'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Button } from '@/components/retroui/Button'
import { Search } from 'lucide-react'
import { Input } from '@/components/retroui/Input'

const TAGS = [
  { label: 'All', value: '' },
  { label: 'AI/ML', value: 'ai-ml' },
  { label: 'IoT', value: 'iot' },
  { label: 'Web3', value: 'web3' },
  { label: 'Security', value: 'security' },
  { label: 'DevOps', value: 'devops' },
  { label: 'Mobile', value: 'mobile' },
  { label: 'Cloud', value: 'cloud' },
]

export function FilterBar({
  currentTag,
  currentSearch,
}: {
  currentTag?: string
  currentSearch?: string
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(currentSearch || '')

  // Sync state with URL params when they change (e.g. back button)
  useEffect(() => {
    setSearch(currentSearch || '')
  }, [currentSearch])

  const handleTagClick = (tag: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (tag) {
      params.set('tag', tag)
    } else {
      params.delete('tag')
    }
    router.push(`/explore?${params.toString()}`)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams(searchParams.toString())
    if (search) {
      params.set('search', search)
    } else {
      params.delete('search')
    }
    router.push(`/explore?${params.toString()}`)
  }

  return (
    <section className="sticky top-16 z-40 bg-background border-b-2 border-black py-4">
      <div className="container mx-auto px-4">
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="flex flex-col sm:flex-row gap-3 max-w-2xl">
            <Input
              type="text"
              placeholder="Search posts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 border-brutal"
            />
            <Button
              type="submit"
              className="bg-primary text-primary-foreground border-brutal shadow-brutal hover:shadow-brutal-sm flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <Search className="w-4 h-4" /> <span className="sm:inline">Search</span>
            </Button>
          </div>
        </form>

        {/* Tag Filters */}
        <div className="relative">
          <div className="flex overflow-x-auto pb-2 -mb-2 no-scrollbar gap-2 scroll-smooth">
            {TAGS.map((tag) => (
              <button
                key={tag.value}
                onClick={() => handleTagClick(tag.value)}
                className={`flex-none px-4 py-2 border-2 border-black font-semibold transition-all text-sm whitespace-nowrap ${currentTag === tag.value || (!currentTag && tag.value === '')
                    ? 'bg-primary text-primary-foreground shadow-brutal'
                    : 'bg-background hover:shadow-brutal-sm'
                  }`}
              >
                {tag.label}
              </button>
            ))}
          </div>
        </div>

        {/* Active Filters */}
        {(currentTag || currentSearch) && (
          <div className="mt-4 flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Active filters:</span>
            {currentTag && (
              <span className="bg-primary/20 border-2 border-black px-3 py-1">
                Tag: {currentTag}
              </span>
            )}
            {currentSearch && (
              <span className="bg-accent/20 border-2 border-black px-3 py-1">
                Search: "{currentSearch}"
              </span>
            )}
            <button
              onClick={() => router.push('/explore')}
              className="text-primary hover:underline ml-2"
            >
              Clear all
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
