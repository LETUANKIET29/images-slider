"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, Pause, Play, Maximize2, Minimize2, Eye, EyeOff, Text } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface NatureSlide {
  id: number
  title: string
  src: string
}

export function NatureSlider() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [slides, setSlides] = useState<NatureSlide[]>([])
  const [isLoading, setIsLoading] = useState(true)
  // Auto-play state - temporarily disabled
  // const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [direction, setDirection] = useState("next")
  const [isAnimating, setIsAnimating] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isCarouselVisible, setIsCarouselVisible] = useState(true)
  const [isTitleVisible, setIsTitleVisible] = useState(true)
  // Auto-play timer ref - temporarily disabled
  // const timerRef = useRef<NodeJS.Timeout | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const response = await fetch('/api/nature-slides')
        const data = await response.json()
        if (data && Array.isArray(data)) {
          setSlides(data)
        }
      } catch (error) {
        console.error('Error fetching slides:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSlides()
  }, [])

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }, [])

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [])

  const goToSlide = useCallback(
    (index: number, dir: "next" | "prev") => {
      if (isAnimating || slides.length === 0) return

      setIsAnimating(true)
      setDirection(dir)
      setCurrentIndex(index)

      setTimeout(() => {
        setIsAnimating(false)
      }, 800)
    },
    [isAnimating, slides.length],
  )

  const nextSlide = useCallback(() => {
    if (slides.length === 0) return
    const newIndex = (currentIndex + 1) % slides.length
    goToSlide(newIndex, "next")
  }, [currentIndex, goToSlide, slides.length])

  const prevSlide = useCallback(() => {
    if (slides.length === 0) return
    const newIndex = (currentIndex - 1 + slides.length) % slides.length
    goToSlide(newIndex, "prev")
  }, [currentIndex, goToSlide, slides.length])

  if (slides.length === 0) {
    return <div>Loading...</div>
  }

  // Calculate previous and next indices for animation
  const prevIndex = (currentIndex - 1 + slides.length) % slides.length
  const nextIndex = (currentIndex + 1) % slides.length

  // Get current slide data
  const currentSlide = slides[currentIndex]

  // Get the other two images for the cards (different from current background)
  const getCardImages = (currentImageSrc: string) => {
    // Get current slide index
    const currentSlideIndex = slides.findIndex(slide => slide.src === currentImageSrc);
    
    // Calculate previous and next indices
    const prevIndex = (currentSlideIndex - 1 + slides.length) % slides.length;
    const nextIndex = (currentSlideIndex + 1) % slides.length;
    
    // Return images in the correct order: [previous, current, next]
    return [
      slides[prevIndex].src,
      currentImageSrc,
      slides[nextIndex].src
    ];
  }

  // Auto-play functionality - temporarily disabled
  /*
  const toggleAutoPlay = useCallback(() => {
    setIsAutoPlaying((prev) => !prev)
  }, [])

  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    if (isAutoPlaying && !isAnimating && slides.length > 0) {
      timerRef.current = setInterval(() => {
        nextSlide()
      }, 6000)
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [isAutoPlaying, nextSlide, isAnimating, slides.length])
  */

  return (
    <div 
      ref={containerRef}
      className={cn(
        "relative w-full overflow-hidden transition-all duration-300",
        isFullscreen ? "fixed inset-0 z-50 bg-black" : "h-[600px] md:h-[700px] lg:h-[800px]"
      )}
    >
      {/* Background slides with animation */}
      <div className="relative w-full h-full">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={cn(
              "absolute inset-0 w-full h-full transition-transform duration-800 ease-in-out",
              index === currentIndex && "z-10",
              index === prevIndex && "z-0",
              index === nextIndex && "z-0",
              index === currentIndex && direction === "next" && !isAnimating && "translate-x-0",
              index === currentIndex && direction === "prev" && !isAnimating && "translate-x-0",
              index === currentIndex && direction === "next" && isAnimating && "animate-slide-in-right",
              index === currentIndex && direction === "prev" && isAnimating && "animate-slide-in-left",
              index !== currentIndex && index !== prevIndex && index !== nextIndex && "-z-10 opacity-0",
              index === prevIndex && direction === "next" && isAnimating && "animate-slide-out-left",
              index === nextIndex && direction === "prev" && isAnimating && "animate-slide-out-right",
            )}
            style={{
              opacity:
                index === currentIndex ? 1 : index === prevIndex || index === nextIndex ? (isAnimating ? 1 : 0) : 0,
            }}
          >
            <Image
              src={slide.src || "/placeholder.svg"}
              alt={slide.title}
              fill
              priority={index === 0}
              quality={75}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
              className="object-cover"
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx4eHRoaHSQtJSEkMjU1LS0yMi4qLjgyPj4+ODU8PkZFRk5PT1VWV1dXV1dXV1f/2wBDAR4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh7/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
            />

            {/* Text overlay with animation */}
            <div
              className={cn(
                "absolute top-1/4 left-[10%] max-w-md text-white z-20 transition-all duration-500",
                isAnimating ? "opacity-0 translate-y-10" : "opacity-100 translate-y-0",
                !isTitleVisible && "opacity-0 translate-y-10 pointer-events-none"
              )}
              style={{
                transitionDelay: isAnimating ? "0ms" : "300ms",
              }}
            >
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">{slide.title}</h2>
            </div>

            {/* Main carousel with 3 images */}
            <div className={cn(
              "absolute bottom-[15%] right-[10%] flex items-center z-10 transition-all duration-500",
              !isCarouselVisible && "opacity-0 translate-y-10 pointer-events-none"
            )}>
              {getCardImages(slide.src).map((imageSrc, cardIndex) => (
                <div
                  key={cardIndex}
                  className={cn(
                    "relative rounded-3xl overflow-hidden shadow-2xl cursor-pointer transition-all duration-700",
                    cardIndex === 0 && "h-[280px] w-[180px] md:h-[350px] md:w-[220px] z-10 -mr-6 md:-mr-10",
                    cardIndex === 1 && "h-[320px] w-[200px] md:h-[400px] md:w-[250px] z-20 -mr-6 md:-mr-10",
                    cardIndex === 2 && "h-[280px] w-[180px] md:h-[350px] md:w-[220px] z-10",
                    isAnimating && "opacity-0 translate-y-20",
                  )}
                  style={{
                    transform: `translateY(${cardIndex === 1 ? "-30px" : "0"}) ${isAnimating ? "translateY(20px)" : ""}`,
                    transitionDelay: isAnimating ? "0ms" : `${cardIndex * 200 + 400}ms`,
                    opacity: isAnimating ? 0 : 1,
                  }}
                  onClick={() => {
                    if (cardIndex === 0) prevSlide()
                    else if (cardIndex === 2) nextSlide()
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = `translateY(${cardIndex === 1 ? "-40px" : "-10px"}) scale(1.05)`
                    e.currentTarget.style.boxShadow = "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = `translateY(${cardIndex === 1 ? "-30px" : "0"})`
                    e.currentTarget.style.boxShadow = ""
                  }}
                >
                  <Image
                    src={imageSrc || "/placeholder.svg"}
                    alt={`Nature image ${cardIndex + 1}`}
                    fill
                    quality={75}
                    sizes="(max-width: 768px) 80px, (max-width: 1200px) 220px, 250px"
                    className="object-cover"
                    placeholder="blur"
                    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx4eHRoaHSQtJSEkMjU1LS0yMi4qLjgyPj4+ODU8PkZFRk5PT1VWV1dXV1dXV1f/2wBDAR4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh7/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Navigation buttons */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 z-30">
        <Button
          variant="outline"
          size="icon"
          className="bg-white/10 backdrop-blur-sm border-white text-white hover:bg-white/30"
          onClick={prevSlide}
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        {/* Auto-play button - temporarily disabled
        <Button
          variant="outline"
          size="icon"
          className="bg-white/10 backdrop-blur-sm border-white text-white hover:bg-white/30"
          onClick={toggleAutoPlay}
        >
          {isAutoPlaying ? (
            <Pause className="h-6 w-6" />
          ) : (
            <Play className="h-6 w-6" />
          )}
        </Button>
        */}
        <Button
          variant="outline"
          size="icon"
          className="bg-white/10 backdrop-blur-sm border-white text-white hover:bg-white/30"
          onClick={nextSlide}
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="bg-white/10 backdrop-blur-sm border-white text-white hover:bg-white/30"
          onClick={() => setIsCarouselVisible(prev => !prev)}
        >
          {isCarouselVisible ? (
            <EyeOff className="h-6 w-6" />
          ) : (
            <Eye className="h-6 w-6" />
          )}
        </Button>
        <Button
          variant="outline"
          size="icon"
          className={cn(
            "bg-white/10 backdrop-blur-sm border-white text-white hover:bg-white/30",
            !isTitleVisible && "opacity-50"
          )}
          onClick={() => setIsTitleVisible(prev => !prev)}
        >
          <Text className="h-6 w-6" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="bg-white/10 backdrop-blur-sm border-white text-white hover:bg-white/30"
          onClick={toggleFullscreen}
        >
          {isFullscreen ? (
            <Minimize2 className="h-6 w-6" />
          ) : (
            <Maximize2 className="h-6 w-6" />
          )}
        </Button>
      </div>
    </div>
  )
}
