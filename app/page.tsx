'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Recipe } from '@/lib/types'
import ThemeToggle from '@/app/components/theme-toggle'

export default function Home() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [filterOpen, setFilterOpen] = useState(false)
  const filterRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchRecipes()
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function fetchRecipes() {
    setLoading(true)
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) console.error(error)
    else setRecipes(data as Recipe[])
    setLoading(false)
  }

  // Derive unique categories from the recipes table data
  const categories = Array.from(
    new Set(
      recipes
        .map((r) => r.category)
        .filter((c): c is string => !!c && c.trim() !== '')
    )
  ).sort()

  const filtered = recipes.filter((r) => {
    const matchesSearch = r.title.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = selectedCategory ? r.category === selectedCategory : true
    return matchesSearch && matchesCategory
  })

  return (
    <main className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">🍳 Recipe Manager</h1>
        <div className="flex gap-2 items-center">
          <ThemeToggle />
          <Link
            href="/recipes/new"
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 cursor-pointer"
          >
            + Add Recipe
          </Link>
        </div>
      </div>

      <input
        type="text"
        placeholder="Search recipes..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full border rounded-lg p-2 mb-3 bg-white text-black dark:bg-gray-900 dark:text-white dark:border-gray-700"
      />

      {/* Filter by category */}
      <div className="relative mb-6" ref={filterRef}>
        <button
          type="button"
          onClick={() => setFilterOpen((prev) => !prev)}
          className="flex items-center gap-2 border rounded-lg px-3 py-2 text-sm bg-white text-black hover:bg-gray-50 dark:bg-gray-900 dark:text-white dark:border-gray-700 dark:hover:bg-gray-800 cursor-pointer"
        >
          <span>
            Filter by:{' '}
            <span className="font-medium">
              {selectedCategory ?? 'All categories'}
            </span>
          </span>
          <svg
            className={`w-4 h-4 transition-transform ${filterOpen ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {filterOpen && (
          <div className="absolute z-10 mt-1 w-56 border rounded-lg shadow-lg bg-white dark:bg-gray-900 dark:border-gray-700 overflow-hidden">
            <button
              type="button"
              onClick={() => {
                setSelectedCategory(null)
                setFilterOpen(false)
              }}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer ${
                selectedCategory === null ? 'font-semibold text-green-600 dark:text-green-400' : ''
              }`}
            >
              All categories
            </button>
            {categories.length === 0 ? (
              <p className="px-3 py-2 text-sm text-gray-400">No categories yet</p>
            ) : (
              categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(cat)
                    setFilterOpen(false)
                  }}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer ${
                    selectedCategory === cat ? 'font-semibold text-green-600 dark:text-green-400' : ''
                  }`}
                >
                  {cat}
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : filtered.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">No recipes found. Add your first one!</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filtered.map((recipe) => (
            <Link
              key={recipe.id}
              href={`/recipes/${recipe.id}`}
              className="border rounded-lg overflow-hidden hover:shadow-lg transition dark:border-gray-700 dark:bg-gray-900"
            >
              {recipe.image_url ? (
                <img
                  src={recipe.image_url}
                  alt={recipe.title}
                  className="w-full h-40 object-cover"
                />
              ) : (
                <div className="w-full h-40 bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-4xl">
                  🍽️
                </div>
              )}
              <div className="p-4">
                <h2 className="font-semibold text-lg">{recipe.title}</h2>
                {recipe.category && (
                  <span className="text-xs text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/30 px-2 py-1 rounded">
                    {recipe.category}
                  </span>
                )}
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">
                  {recipe.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  )
}