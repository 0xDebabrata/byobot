import mergeTW from '@/libs/mergeTW'
import { HTMLAttributes } from 'react'

interface Props extends HTMLAttributes<HTMLImageElement> {
  src?: string
  alt?: string
  className?: string
}

export default ({ src, className, ...props }: Props) => (
  <img {...props} src={src} className={mergeTW(`w-10 h-10 rounded-full object-cover ${className}`)} />
)
