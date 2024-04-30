import { z } from 'zod'

export const AVAILABLE_SIZES = ['S', 'M', 'L'] as const
export const AVAILABLE_COLORS = [
  'white',
  'beige',
  'green',
  'purple',
  'blue',
] as const
export const AVAILABLE_SORT = ['none', 'price-asc', 'price-desc'] as const

// sort -> 'none' | 'price-asc' | 'price-desc'; can be only one of these values which is why we use z.enum instead of z.array

export const ProductFilterValidator = z.object({
  // define the shape of the object
  size: z.array(z.enum(AVAILABLE_SIZES)),
  color: z.array(z.enum(AVAILABLE_COLORS)),
  sort: z.enum(['none', 'price-asc', 'price-desc']),
  price: z.tuple([z.number(), z.number()]),
})

export type ProductState = Omit<
  z.infer<typeof ProductFilterValidator>,
  'price'
> & {
  price: { isCustom: boolean; range: [number, number] }
}

// doing this will:
// 1. enforce the shape on the backend as well (for security)
// 2. enforce the shape on the frontend as well (for full type safety)
// 3.
