import React, { useEffect, useState } from 'react'

// Simple banner rotator/carousel used on the Home hero area.
export default function BannerRotator({ banners = ['/1.jpg', '/2.jpg', '/3.jpg', '/4.jpg'], interval = 5000 }) {
  const [current, setCurrent] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    if (isPaused) return
    const t = setInterval(() => setCurrent((c) => (c + 1) % banners.length), interval)
    return () => clearInterval(t)
  }, [banners.length, interval, isPaused])

  // Keyboard navigation
  const onKey = (e) => {
    if (e.key === 'ArrowLeft') setCurrent((c) => (c - 1 + banners.length) % banners.length)
    if (e.key === 'ArrowRight') setCurrent((c) => (c + 1) % banners.length)
  }

  return (
    <div
      className="absolute inset-0 w-full h-full rounded-xl overflow-hidden shadow-lg"
      tabIndex={0}
      onKeyDown={onKey}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      role="region"
      aria-roledescription="carousel"
    >
      {banners.map((src, i) => (
        <div
          key={src + i}
          className={`absolute inset-0 transition-opacity duration-700 ${i === current ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          aria-hidden={i === current ? false : true}
        >
          <img src={src} alt={`Banner ${i + 1}`} className="w-full h-full object-cover object-center" />
        </div>
      ))}

    
      <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-2">
        {banners.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            aria-label={`Show banner ${i + 1}`}
            className={`w-3 h-3 rounded-full ${i === current ? 'bg-white' : 'bg-white/50'}`}
          />
        ))}
      </div>
    </div>
  )
}
