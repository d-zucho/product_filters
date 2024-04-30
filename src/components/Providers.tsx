'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { PropsWithChildren } from 'react'

const client = new QueryClient() // Create a new instance of QueryClient
// it is a cache that stores the data fetched from the server
// cache is a store that stores the data fetched from the server

const Providers = ({ children }: PropsWithChildren<{}>) => {
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

export default Providers
