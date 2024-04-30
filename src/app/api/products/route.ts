import { db } from '@/db'
import { ProductFilterValidator } from '@/lib/validators/product-validator'
import { NextRequest } from 'next/server'

class Filter {
  private filters: Map<string, string[]> = new Map()
  // a map is a collection of key-value pairs
  // this means that the filter is a map of string to string[]
  // for example, the filter could be a map of "color" to ["red", "blue"]

  // check if a filter is applied
  hasFilter() {
    return this.filters.size > 0
  }

  // add a filter
  add(key: string, operator: string, value: string | number) {
    // get the current filter for the key
    const filter = this.filters.get(key) || []

    // add value to filter but if it is a number, add it without quotes
    filter.push(
      `${key} ${operator} ${typeof value === 'number' ? value : `"${value}"`}`
    )
    this.filters.set(key, filter)
  }

  addRaw(key: string, rawFilter: string) {
    this.filters.set(key, [rawFilter])
  }

  get() {
    const parts: string[] = []

    this.filters.forEach((filter) => {
      const groupedValues = filter.join(` OR `)
      parts.push(`(${groupedValues})`)
    })
    return parts.join(` AND `)
  }
}
const AVG_PRODUCT_PRICE = 25
const MAX_PRODUCT_PRICE = 50

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json()

    // Validate the incoming request body
    const { color, price, size, sort } = ProductFilterValidator.parse(
      body.filter
    )

    const filter = new Filter()

    color.forEach((color) => filter.add('color', '=', color))
    size.forEach((size) => filter.add('size', '=', size))
    filter.addRaw('price', `price >= ${price[0]} AND price <= ${price[1]}`)

    const products = await db.query({
      topK: 12,
      vector: [
        0,
        0,
        sort === 'none'
          ? AVG_PRODUCT_PRICE
          : sort === 'price-asc'
          ? 0
          : MAX_PRODUCT_PRICE,
      ],
      includeMetadata: true,
      filter: filter.hasFilter() ? filter.get() : undefined,
    })

    return new Response(JSON.stringify(products))
  } catch (error) {
    console.log('Error: ', error)

    return new Response(JSON.stringify({ message: 'Internal Server Error' }), {
      status: 500,
    })
  }
}
