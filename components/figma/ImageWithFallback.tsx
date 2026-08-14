import React, { useState } from 'react'
import { ImageOff } from 'lucide-react'

export function ImageWithFallback(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  const [didError, setDidError] = useState(false)

  const handleError = () => {
    setDidError(true)
  }

  const { src, alt, style, className, ...rest } = props

  return didError ? (
    <div
      className={`inline-block bg-muted text-muted-foreground text-center align-middle flex items-center justify-center ${className ?? ''}`}
      style={style}
    >
      <ImageOff className="w-8 h-8 opacity-40" aria-hidden />
      <span className="sr-only">{alt || 'Image unavailable'}</span>
    </div>
  ) : (
    <img src={src} alt={alt} className={className} style={style} {...rest} onError={handleError} />
  )
}
