'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Recipe } from '@/lib/types'
import ThemeToggle from '@/app/components/theme-toggle'

export default function RecipeDetail() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [recipe, setRecipe] = useState<Recipe | null>(null)

  useEffect(() => {
    fetchRecipe()
  }, [id])

  async function fetchRecipe() {
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .eq('id', id)
      .single()

    if (error) console.error(error)
    else setRecipe(data as Recipe)
  }

  async function handleDelete() {
    if (!confirm('Delete this recipe?')) return
    const { error } = await supabase.from('recipes').delete().eq('id', id)
    if (!error) router.push('/')
  }

  if (!recipe) return <p className="p-6">Loading...</p>

  return (
    <main className="max-w-2xl mx-auto p-6">
      <div className="flex justify-between items-center">
        <Link href="/" className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 cursor-pointer">
          ← Back
        </Link>
        <ThemeToggle />
      </div>

      {recipe.image_url && (
        <img
          src={recipe.image_url}
          alt={recipe.title}
          className="w-full h-64 object-cover rounded-lg mt-4"
        />
      )}

      <h1 className="text-3xl font-bold mt-4">{recipe.title}</h1>
      <p className="text-gray-600 dark:text-gray-400 mt-1">{recipe.description}</p>

      <div className="flex gap-4 text-sm text-gray-500 dark:text-gray-400 mt-3">
        {recipe.prep_time && <span>⏱ Prep: {recipe.prep_time} min</span>}
        {recipe.cook_time && <span>🔥 Cook: {recipe.cook_time} min</span>}
        {recipe.servings && <span>🍽 Serves: {recipe.servings}</span>}
      </div>

      <h2 className="text-xl font-semibold mt-6">Ingredients</h2>
      <ul className="list-disc list-inside mt-2 space-y-1">
        {recipe.ingredients.map((ing, i) => (
          <li key={i}>{ing}</li>
        ))}
      </ul>

      <h2 className="text-xl font-semibold mt-6">Instructions</h2>
      <p className="whitespace-pre-line mt-2">{recipe.instructions}</p>

      <div className="flex gap-3 mt-8">
        <Link
          href={`/recipes/${id}/edit`}
          className="bg-gray-200 text-black px-4 py-2 rounded-lg hover:bg-gray-300 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 cursor-pointer"
        >
          Edit
        </Link>
        <button
          onClick={handleDelete}
          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 cursor-pointer"
        >
          Delete
        </button>
      </div>
    </main>
  )
}