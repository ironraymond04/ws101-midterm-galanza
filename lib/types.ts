export interface Recipe {
  id: string
  title: string
  description: string | null
  ingredients: string[]
  instructions: string
  category: string | null
  prep_time: number | null
  cook_time: number | null
  servings: number | null
  image_url: string | null
  created_at: string
}