'use client'
import React, { forwardRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
} from './dialog'
import { DialogTitle } from '@radix-ui/react-dialog'
import { useModal } from '../editor/hooks/useModal'
import { cn } from '@/lib/utils'

type Props = {
  title?: string
  subheading?: string
  children: React.ReactNode
  defaultOpen?: boolean
  className?:string
}

const CustomModal = forwardRef<HTMLDivElement, Props>(
  ({ children, defaultOpen, subheading, title,className }, ref) => {
    const { isOpen, setClose } = useModal()
    return (
      <Dialog
        open={isOpen || defaultOpen}
        onOpenChange={setClose}
        
      
      >
        <DialogContent
          ref={ref} // Forwarded ref is passed here
          className={
            cn(
              "md:max-h-[700px] md:h-fit h-screen bg-card",
              className
            )
          }
        >
          <DialogHeader className="pt-8 text-left">
            {title && <DialogTitle className="text-2xl font-bold">{title}</DialogTitle>}
            {subheading&&<DialogDescription>{subheading}</DialogDescription>}
            {children}
          </DialogHeader>
        </DialogContent>
      </Dialog>
    )
  }
)

CustomModal.displayName = 'CustomModal'

export default CustomModal
