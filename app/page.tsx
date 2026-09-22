'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Recipe } from '@/lib/types'

export default function Home() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchRecipes()
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

  const filtered = recipes.filter((r) =>
    r.title.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <main className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">🍳 Recipe Manager</h1>
        <Link
          href="/recipes/new"
          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 cursor-pointer"
        >
          + Add Recipe
        </Link>
      </div>
      <input
        type="text"
        placeholder="Search recipes..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full border rounded-lg p-2 mb-6"
      />

      {loading ? (
        <p>Loading...</p>
      ) : filtered.length === 0 ? (
        <p className="text-gray-500">No recipes found. Add your first one!</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filtered.map((recipe) => (
            <Link
              key={recipe.id}
              href={`/recipes/${recipe.id}`}
              className="border rounded-lg overflow-hidden hover:shadow-lg transition"
            >
              {recipe.image_url ? (
                <img
                  src={recipe.image_url}
                  alt={recipe.title}
                  className="w-full h-40 object-cover"
                />
              ) : (
                <div className="w-full h-40 bg-gray-100 flex items-center justify-center text-4xl">
                  🍽️
                </div>
              )}
              <div className="p-4">
                <h2 className="font-semibold text-lg">{recipe.title}</h2>
                {recipe.category && (
                  <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                    {recipe.category}
                  </span>
                )}
                <p className="text-sm text-gray-500 mt-2 line-clamp-2">
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