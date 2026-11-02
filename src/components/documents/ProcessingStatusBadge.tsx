import React from 'react'
import { CheckCircle2, Clock, Loader2, AlertCircle, Cpu } from 'lucide-react'
import { ProcessingStatus } from '../../types'
import { Badge } from '../ui/Badge'

interface ProcessingStatusBadgeProps {
  status: ProcessingStatus
  size?: 'sm' | 'md'
}

export const ProcessingStatusBadge: React.FC<ProcessingStatusBadgeProps> = ({ status, size = 'md' }) => {
  switch (status) {
    case 'ready':
      return (
        <Badge variant="success" size={size} className="gap-1.5 font-medium">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Ready</span>
        </Badge>
      )
    case 'indexing':
      return (
        <Badge variant="primary" size={size} className="gap-1.5 font-medium animate-pulse">
          <Cpu className="w-3.5 h-3.5 animate-spin" />
          <span>Indexing</span>
        </Badge>
      )
    case 'extracting':
      return (
        <Badge variant="cyan" size={size} className="gap-1.5 font-medium">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>Extracting</span>
        </Badge>
      )
    case 'uploading':
      return (
        <Badge variant="secondary" size={size} className="gap-1.5 font-medium">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>Uploading</span>
        </Badge>
      )
    case 'queued':
      return (
        <Badge variant="default" size={size} className="gap-1.5 font-medium">
          <Clock className="w-3.5 h-3.5" />
          <span>Queued</span>
        </Badge>
      )
    case 'failed':
      return (
        <Badge variant="destructive" size={size} className="gap-1.5 font-medium">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>Failed</span>
        </Badge>
      )
    default:
      return null
  }
}

