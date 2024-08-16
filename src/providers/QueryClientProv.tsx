"use client"
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import React from 'react'

type Props = {
  children:React.ReactNode
}
const queryClient = new QueryClient()

export default function QueryClientProv({children}: Props) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
};