'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function NewRecipe() {
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
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    let image_url = null

    if (imageFile) {
      const fileName = `${Date.now()}-${imageFile.name}`
      const { error: uploadError } = await supabase.storage
        .from('recipe-images')
        .upload(fileName, imageFile)

      if (!uploadError) {
        const { data } = supabase.storage
          .from('recipe-images')
          .getPublicUrl(fileName)
        image_url = data.publicUrl
      }
    }

    const { error } = await supabase.from('recipes').insert({
      title: form.title,
      description: form.description,
      ingredients: form.ingredients.split('\n').filter((i) => i.trim() !== ''),
      instructions: form.instructions,
      category: form.category || null,
      prep_time: form.prep_time ? parseInt(form.prep_time) : null,
      cook_time: form.cook_time ? parseInt(form.cook_time) : null,
      servings: form.servings ? parseInt(form.servings) : null,
      image_url,
    })

    setSaving(false)

    if (error) {
      alert('Error saving recipe: ' + error.message)
    } else {
      router.push('/')
    }
  }

  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Add a New Recipe</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="title"
          placeholder="Recipe title"
          required
          value={form.title}
          onChange={handleChange}
          className="w-full border rounded-lg p-2"
        />
        <textarea
          name="description"
          placeholder="Short description"
          value={form.description}
          onChange={handleChange}
          className="w-full border rounded-lg p-2"
          rows={2}
        />
        <textarea
          name="ingredients"
          placeholder={'Ingredients (one per line)\ne.g.\n2 eggs\n1 cup flour'}
          required
          value={form.ingredients}
          onChange={handleChange}
          className="w-full border rounded-lg p-2"
          rows={5}
        />
        <textarea
          name="instructions"
          placeholder="Instructions"
          required
          value={form.instructions}
          onChange={handleChange}
          className="w-full border rounded-lg p-2"
          rows={5}
        />
        <div className="grid grid-cols-3 gap-2">
          <input
            name="prep_time"
            type="number"
            placeholder="Prep (min)"
            value={form.prep_time}
            onChange={handleChange}
            className="border rounded-lg p-2"
          />
          <input
            name="cook_time"
            type="number"
            placeholder="Cook (min)"
            value={form.cook_time}
            onChange={handleChange}
            className="border rounded-lg p-2"
          />
          <input
            name="servings"
            type="number"
            placeholder="Servings"
            value={form.servings}
            onChange={handleChange}
            className="border rounded-lg p-2"
          />
        </div>
        <input
          name="category"
          placeholder="Category (e.g. Dessert, Breakfast)"
          value={form.category}
          onChange={handleChange}
          className="w-full border rounded-lg p-2"
        />
<input
  type="file"
  accept="image/*"
  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
  className="hidden"
  id="image-upload"
/>
<label
  htmlFor="image-upload"
  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 cursor-pointer"
>
  {imageFile ? imageFile.name : "Choose Image" }
</label>
        <button
          type="submit"
          disabled={saving}
          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 disabled:opacity-50 cursor-pointer"
        >
          {saving ? 'Saving...' : 'Save Recipe'}
        </button>
      </form>
    </main>
  )
}