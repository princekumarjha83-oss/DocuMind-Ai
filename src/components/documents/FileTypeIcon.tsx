import React from 'react'
import { FileText, FileSpreadsheet, FileCode2, Presentation, File } from 'lucide-react'
import { DocumentType } from '../../types'
import { cn } from '../../utils/cn'

interface FileTypeIconProps {
  type: DocumentType | string
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export const FileTypeIcon: React.FC<FileTypeIconProps> = ({ type, className, size = 'md' }) => {
  const normType = (type || 'file').toLowerCase()

  const sizeClass = {
    sm: 'w-6 h-6 p-1 text-xs rounded-lg',
    md: 'w-9 h-9 p-2 text-sm rounded-xl',
    lg: 'w-12 h-12 p-2.5 text-base rounded-2xl',
  }

  const iconSize = size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-5 h-5' : 'w-7 h-7'

  if (normType === 'pdf') {
    return (
      <div className={cn('bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center justify-center shrink-0', sizeClass[size], className)}>
        <FileText className={iconSize} />
      </div>
    )
  }

  if (normType === 'docx' || normType === 'doc') {
    return (
      <div className={cn('bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center justify-center shrink-0', sizeClass[size], className)}>
        <FileText className={iconSize} />
      </div>
    )
  }

  if (normType === 'csv' || normType === 'xlsx') {
    return (
      <div className={cn('bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center shrink-0', sizeClass[size], className)}>
        <FileSpreadsheet className={iconSize} />
      </div>
    )
  }

  if (normType === 'md' || normType === 'txt') {
    return (
      <div className={cn('bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center shrink-0', sizeClass[size], className)}>
        <FileCode2 className={iconSize} />
      </div>
    )
  }

  if (normType === 'pptx') {
    return (
      <div className={cn('bg-orange-500/10 text-orange-500 border border-orange-500/20 flex items-center justify-center shrink-0', sizeClass[size], className)}>
        <Presentation className={iconSize} />
      </div>
    )
  }

  return (
    <div className={cn('bg-slate-500/10 text-slate-500 border border-slate-500/20 flex items-center justify-center shrink-0', sizeClass[size], className)}>
      <File className={iconSize} />
    </div>
  )
}

