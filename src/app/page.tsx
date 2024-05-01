'use client'

import Product from '@/components/Products/Product'
import ProductSkeleton from '@/components/Products/ProductSkeleton'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Slider } from '@/components/ui/slider'
import type { Product as TProduct } from '@/db'
import { cn } from '@/lib/utils'
import { ProductState } from '@/lib/validators/product-validator'

import debounce from 'lodash.debounce'
import { useQuery } from '@tanstack/react-query'
import { QueryResult } from '@upstash/vector'
import axios from 'axios'
import { ChevronDown, Filter } from 'lucide-react'
import { useCallback, useState } from 'react'
import _ from 'lodash'
import EmptyState from '@/components/Products/EmptyState'

const SORT_OPTIONS = [
  { name: 'none', value: 'none' },
  { name: 'Price: Low to High', value: 'price-asc' },
  { name: 'Price: High to Low', value: 'price-desc' },
] as const
// as const will tell us that array is readonly and we can't modify it

const SUBCATEGORIES = [
  { name: 'T-Shirts', selected: true, href: '#' },
  { name: 'Hoodies', selected: false, href: '#' },
  { name: 'Sweatshirts', selected: false, href: '#' },
  { name: 'Accessories', selected: false, href: '#' },
]

const COLORS_FILTERS = {
  id: 'color',
  name: 'Color',
  options: [
    { value: 'white', label: 'White' },
    { value: 'beige', label: 'Beinge' },
    { value: 'blue', label: 'Blue' },
    { value: 'green', label: 'Green' },
    { value: 'purple', label: 'Purple' },
  ] as const,
}

const SIZE_FILTERS = {
  id: 'size',
  name: 'Size',
  options: [
    { value: 'S', label: 'S' },
    { value: 'M', label: 'M' },
    { value: 'L', label: 'L' },
  ],
} as const

const PRICE_FILTERS = {
  id: 'price',
  name: 'Price',
  options: [
    { value: [0, 100], label: 'Any price' },
    { value: [0, 20], label: 'Under $20' },
    { value: [0, 40], label: 'Under $40' },
    // custom option defined in JSX
  ] as const,
}
const DEFAULT_CUSTOM_PRICE = [0, 100] as [number, number]

export default function Home() {
  const [filter, setFilter] = useState<ProductState>({
    // default values for filters
    color: ['white', 'beige', 'blue', 'green', 'purple'],
    price: { isCustom: false, range: DEFAULT_CUSTOM_PRICE },
    size: ['S', 'M', 'L'],
    sort: 'none',
  })

  // useQuery is a hook that will cache the data for us
  const { data: products, refetch } = useQuery({
    queryKey: ['products'], // the result of the data caching
    queryFn: async () => {
      const { data } = await axios.post<QueryResult<TProduct>[]>(
        'http://localhost:3000/api/products',
        {
          filter: {
            sort: filter.sort,
            color: filter.color,
            size: filter.size,
            price: filter.price.range,
          },
        }
      )
      return data
    },
  })

  const onSubmit = () => refetch()

  const debouncedSubmit = debounce(onSubmit, 400)
  const _debouncedSubmit = useCallback(debouncedSubmit, [])

  /**
   * the keyof operator will give us the keys
   * of the object so that we can use them as a type
   */
  const applyArrayFilter = ({
    category,
    value,
  }: {
    category: keyof Omit<typeof filter, 'sort' | 'price'>
    value: string // can be size or color
  }) => {
    // if the value is already in the array, remove it
    // otherwise add it
    const isFilterApplied = filter[category].includes(value as never)

    if (isFilterApplied) {
      setFilter((prev) => ({
        ...prev,
        [category]: prev[category].filter((v) => v !== value),
      }))
    } else {
      setFilter((prev) => ({
        ...prev,
        [category]: [...prev[category], value],
      }))
    }

    // refetch the data
    _debouncedSubmit()
  }

  const minPrice = Math.min(filter.price.range[0], filter.price.range[1])
  const maxPrice = Math.max(filter.price.range[0], filter.price.range[1])

  return (
    <main className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
      <div className='flex items-baseline justify-between border-b border-gray-200 pb-6 pt-24'>
        <h1 className='text-4xl font-bold tracking-tight text-gray-900'>
          High-quality cotton selection
        </h1>

        {/* DROPDOWN MENU */}
        <div className='flex items-center'>
          <DropdownMenu>
            <DropdownMenuTrigger className='group inline-flex justify-center text-sm font-medium text-gray-700 hover:text-gray-900'>
              Sort
              <ChevronDown className='-mr-1 ml-1 w-5 h-5 flex-shrink-0 text-gray-400 group-hover:text-gray-500' />
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              {SORT_OPTIONS.map((option) => (
                <button
                  className={cn('text-left w-full block px-4 py-2 text-sm', {
                    'text-gray-900': option.value === filter.sort,
                    'text-gray-500': option.value !== filter.sort,
                  })}
                  key={option.name}
                  onClick={() => {
                    setFilter((prev) => ({
                      ...prev,
                      sort: option.value,
                    }))
                    _debouncedSubmit()
                  }}
                >
                  {option.name}
                </button>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <button className='-m-2 ml-4 p-2 text-gray-400 hover:text-gray-500 sm:ml-6 lg:hidden'>
            <Filter className='w-5 h-5' />
          </button>
        </div>
      </div>

      <section className='pb-24 pt-6'>
        <div className='grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-4'>
          {/* FILTERS */}
          <div className='hidden lg:block'>
            <ul className='space-y-4 border-b border-gray-200 pb-6 text-sm font-medium text-gray-900'>
              {SUBCATEGORIES.map((category) => (
                <li key={category.name}>
                  <button
                    disabled={!category.selected}
                    className='disabled:cursor-not-allowed disabled:opacity-60'
                  >
                    {category.name}
                  </button>
                </li>
              ))}
            </ul>

            <Accordion type='multiple' className='animate-none'>
              {/* Color filter */}
              <AccordionItem value='color'>
                <AccordionTrigger className='py-3 text-sm text-gray-400 hover:text-gray-500'>
                  <span className='font-medium text-gray-900'>Color</span>
                </AccordionTrigger>
                <AccordionContent className='ht-6 animate-none'>
                  <ul className='space-y-4'>
                    {COLORS_FILTERS.options.map((option, optionIndex) => (
                      <li
                        key={option.value}
                        className='flex items-center group'
                      >
                        <input
                          type='checkbox'
                          id={`color-${optionIndex}`}
                          checked={filter.color.includes(option.value)}
                          className='h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 group'
                          onChange={() => {
                            applyArrayFilter({
                              category: 'color',
                              value: option.value,
                            })
                          }}
                        />
                        <label
                          htmlFor={`color-${optionIndex}`}
                          className='ml-3 text-sm text-gray-600 group-hover:cursor-pointer group-hover:text-gray-900'
                        >
                          {option.label}
                        </label>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>

              {/* Size Filters */}
              <AccordionItem value='size'>
                <AccordionTrigger className='py-3 text-sm text-gray-400 hover:text-gray-500'>
                  <span className='font-medium text-gray-900'>Size</span>
                </AccordionTrigger>
                <AccordionContent className='ht-6 animate-none'>
                  <ul className='space-y-4'>
                    {SIZE_FILTERS.options.map((option, optionIndex) => (
                      <li
                        key={option.value}
                        className='flex items-center group'
                      >
                        <input
                          type='checkbox'
                          id={`size-${optionIndex}`}
                          checked={filter.size.includes(option.value)}
                          className='h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 group'
                          onChange={() => {
                            applyArrayFilter({
                              category: 'size',
                              value: option.value,
                            })
                          }}
                        />
                        <label
                          htmlFor={`size-${optionIndex}`}
                          className='ml-3 text-sm text-gray-600 group-hover:cursor-pointer group-hover:text-gray-900'
                        >
                          {option.label}
                        </label>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>

              {/* PRICE FILTER */}
              <AccordionItem value='price'>
                <AccordionTrigger className='py-3 text-sm text-gray-400 hover:text-gray-500'>
                  <span className='font-medium text-gray-900'>Price</span>
                </AccordionTrigger>
                <AccordionContent className='ht-6 animate-none'>
                  <ul className='space-y-4'>
                    {PRICE_FILTERS.options.map((option, optionIndex) => (
                      <li
                        key={option.label}
                        className='flex items-center group'
                      >
                        <input
                          type='radio'
                          id={`price-${optionIndex}`}
                          checked={
                            !filter.price.isCustom &&
                            filter.price.range[0] === option.value[0] &&
                            filter.price.range[1] === option.value[1]
                          }
                          className='h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 group'
                          onChange={() => {
                            setFilter((prev) => ({
                              ...prev,
                              price: {
                                isCustom: false,
                                range: [...option.value],
                              },
                            }))
                            _debouncedSubmit()
                          }}
                        />
                        <label
                          htmlFor={`price-${optionIndex}`}
                          className='ml-3 text-sm text-gray-600 group-hover:cursor-pointer group-hover:text-gray-900'
                        >
                          {option.label}
                        </label>
                      </li>
                    ))}
                    <li className='flex justify-center flex-col gap-2'>
                      <div>
                        <input
                          type='radio'
                          id={`price-${PRICE_FILTERS.options.length}`}
                          checked={filter.price.isCustom}
                          className='h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 group'
                          onChange={() => {
                            setFilter((prev) => ({
                              ...prev,
                              price: {
                                isCustom: true,
                                range: [0, 100],
                              },
                            }))
                            _debouncedSubmit()
                          }}
                        />
                        <label
                          htmlFor={`price-${PRICE_FILTERS.options.length}`}
                          className='ml-3 text-sm text-gray-600 group-hover:cursor-pointer group-hover:text-gray-900'
                        >
                          Custom
                        </label>
                      </div>
                      <div className='flex justify-between'>
                        <p className='font-medium'>Price</p>
                        <div>
                          {filter.price.isCustom
                            ? minPrice.toFixed(0)
                            : filter.price.range[0].toFixed(0)}{' '}
                          $ -{' '}
                          {filter.price.isCustom
                            ? maxPrice.toFixed(0)
                            : filter.price.range[1].toFixed(0)}{' '}
                          $
                        </div>
                      </div>
                      <Slider
                        className={cn({ 'opacity-50': !filter.price.isCustom })}
                        disabled={!filter.price.isCustom}
                        onValueChange={(range) => {
                          const [newMin, newMax] = range

                          setFilter((prev) => ({
                            ...prev,
                            price: {
                              isCustom: true,
                              range: [newMin, newMax],
                            },
                          }))
                          _debouncedSubmit()
                        }}
                        value={
                          filter.price.isCustom
                            ? filter.price.range
                            : DEFAULT_CUSTOM_PRICE
                        }
                        min={DEFAULT_CUSTOM_PRICE[0]}
                        defaultValue={DEFAULT_CUSTOM_PRICE}
                        max={DEFAULT_CUSTOM_PRICE[1]}
                        step={5}
                      />
                    </li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* PRODUCT GRID */}
          <ul className='lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8'>
            {products && products.length === 0 ? (
              <EmptyState />
            ) : products ? (
              products.map((product, index) => (
                <Product key={index} product={product.metadata!} />
                // metadata is the data that we have stored in the database (name, price, imageId, etc.)
              ))
            ) : (
              new Array(12)
                .fill(null)
                .map((_, i) => <ProductSkeleton key={i} />)
            )}
          </ul>
        </div>
      </section>
    </main>
  )
}
