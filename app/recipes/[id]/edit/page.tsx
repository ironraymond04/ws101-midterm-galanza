'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import ThemeToggle from '@/app/components/theme-toggle'

export default function EditRecipe() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [form, setForm] = useState({
    title: '',
    description: '',
    ingredients: '',
    instructions: '',
    category: '',
    prep_time: '',
    cook_time: '',
    servings: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchRecipe()
  }, [id])

  async function fetchRecipe() {
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .eq('id', id)
      .single()

    if (data) {
      setForm({
        title: data.title,
        description: data.description || '',
        ingredients: data.ingredients.join('\n'),
        instructions: data.instructions,
        category: data.category || '',
        prep_time: data.prep_time?.toString() || '',
        cook_time: data.cook_time?.toString() || '',
        servings: data.servings?.toString() || '',
      })
    }
    setLoading(false)
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    const { error } = await supabase
      .from('recipes')
      .update({
        title: form.title,
        description: form.description,
        ingredients: form.ingredients.split('\n').filter((i) => i.trim() !== ''),
        instructions: form.instructions,
        category: form.category || null,
        prep_time: form.prep_time ? parseInt(form.prep_time) : null,
        cook_time: form.cook_time ? parseInt(form.cook_time) : null,
        servings: form.servings ? parseInt(form.servings) : null,
      })
      .eq('id', id)

    setSaving(false)

    if (error) alert('Error: ' + error.message)
    else router.push(`/recipes/${id}`)
  }

  if (loading) return <p className="p-6">Loading...</p>

  const inputClass =
    "w-full border rounded-lg p-2 bg-white text-black dark:bg-gray-900 dark:text-white dark:border-gray-700"
  const numberClass =
    "border rounded-lg p-2 bg-white text-black dark:bg-gray-900 dark:text-white dark:border-gray-700"

  return (
    <main className="max-w-2xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Edit Recipe</h1>
        <ThemeToggle />
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="title"
          required
          value={form.title}
          onChange={handleChange}
          className={inputClass}
        />
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          className={inputClass}
          rows={2}
        />
        <textarea
          name="ingredients"
          required
          value={form.ingredients}
          onChange={handleChange}
          className={inputClass}
          rows={5}
        />
        <textarea
          name="instructions"
          required
          value={form.instructions}
          onChange={handleChange}
          className={inputClass}
          rows={5}
        />
        <div className="grid grid-cols-3 gap-2">
          <input
            name="prep_time"
            type="number"
            value={form.prep_time}
            onChange={handleChange}
            className={numberClass}
          />
          <input
            name="cook_time"
            type="number"
            value={form.cook_time}
            onChange={handleChange}
            className={numberClass}
          />
          <input
            name="servings"
            type="number"
            value={form.servings}
            onChange={handleChange}
            className={numberClass}
          />
        </div>
        <input
          name="category"
          value={form.category}
          onChange={handleChange}
          className={inputClass}
        />
        <button
          type="submit"
          disabled={saving}
          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 disabled:opacity-50 cursor-pointer"
        >
          {saving ? 'Saving...' : 'Update Recipe'}
        </button>
      </form>
    </main>
  )
}