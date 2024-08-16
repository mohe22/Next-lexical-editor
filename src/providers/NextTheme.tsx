"use client"

import { ThemeProvider } from "next-themes"
import React from "react"

type Props = {
    children:React.ReactNode
}

export default function NextTheme({children}: Props) {
  return (
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
        {children}
        </ThemeProvider>
  )
};