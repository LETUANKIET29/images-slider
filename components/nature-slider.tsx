"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, Pause, Play, Maximize2, Minimize2, Eye, EyeOff, Text } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

// Define the structure for each slide in the nature slider
// Định nghĩa cấu trúc cho mỗi slide trong nature slider
interface NatureSlide {
  id: number
  title: string
  src: string
}

export function NatureSlider() {
  // State management for the slider
  // Quản lý state cho slider
  const [currentIndex, setCurrentIndex] = useState(0)        // Current slide index / Vị trí slide hiện tại
  const [slides, setSlides] = useState<NatureSlide[]>([])    // Array of all slides / Mảng chứa tất cả slides
  const [isLoading, setIsLoading] = useState(true)           // Loading state / Trạng thái đang tải
  // Auto-play state - temporarily disabled
  // const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [direction, setDirection] = useState("next")         // Slide transition direction / Hướng chuyển slide
  const [isAnimating, setIsAnimating] = useState(false)      // Animation state / Trạng thái animation
  const [isFullscreen, setIsFullscreen] = useState(false)    // Fullscreen mode / Chế độ toàn màn hình
  const [isCarouselVisible, setIsCarouselVisible] = useState(true)  // Carousel visibility / Hiển thị carousel
  const [isTitleVisible, setIsTitleVisible] = useState(true) // Title visibility / Hiển thị tiêu đề
  // Auto-play timer ref - temporarily disabled
  // const timerRef = useRef<NodeJS.Timeout | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Fetch slides data when component mounts
  // Lấy dữ liệu slides khi component được mount
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

  // Toggle fullscreen mode
  // Chuyển đổi chế độ toàn màn hình
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }, [])

  // Listen for fullscreen changes
  // Lắng nghe sự thay đổi chế độ toàn màn hình
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [])

  // Navigate to a specific slide with animation
  // Điều hướng đến một slide cụ thể với animation
  const goToSlide = useCallback(
    (index: number, dir: "next" | "prev") => {
      if (isAnimating || slides.length === 0) return

      setIsAnimating(true)
      setDirection(dir)
      setCurrentIndex(index)

      // Reset animation state after transition
      // Đặt lại trạng thái animation sau khi chuyển đổi
      setTimeout(() => {
        setIsAnimating(false)
      }, 800)
    },
    [isAnimating, slides.length],
  )

  // Navigate to next slide
  // Điều hướng đến slide tiếp theo
  const nextSlide = useCallback(() => {
    if (slides.length === 0) return
    const newIndex = (currentIndex + 1) % slides.length
    goToSlide(newIndex, "next")
  }, [currentIndex, goToSlide, slides.length])

  // Navigate to previous slide
  // Điều hướng đến slide trước đó
  const prevSlide = useCallback(() => {
    if (slides.length === 0) return
    const newIndex = (currentIndex - 1 + slides.length) % slides.length
    goToSlide(newIndex, "prev")
  }, [currentIndex, goToSlide, slides.length])

  // Show loading state if no slides
  // Hiển thị trạng thái loading nếu không có slides
  if (slides.length === 0) {
    return <div>Loading...</div>
  }

  // Calculate indices for previous and next slides
  // Tính toán chỉ số cho slides trước và sau
  const prevIndex = (currentIndex - 1 + slides.length) % slides.length
  const nextIndex = (currentIndex + 1) % slides.length

  // Get current slide data
  // Lấy dữ liệu slide hiện tại
  const currentSlide = slides[currentIndex]

  // Get images for the carousel cards
  // Lấy ảnh cho các card trong carousel
  const getCardImages = (currentImageSrc: string) => {
    const currentSlideIndex = slides.findIndex(slide => slide.src === currentImageSrc)
    const prevIndex = (currentSlideIndex - 1 + slides.length) % slides.length
    const nextIndex = (currentSlideIndex + 1) % slides.length
    return [
      slides[prevIndex].src,
      currentImageSrc,
      slides[nextIndex].src
    ]
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
    // Main container with responsive classes
    // Container chính với các class responsive
    <div 
      ref={containerRef}
      className={cn(
        "relative w-full overflow-hidden transition-all duration-300",
        isFullscreen ? "fixed inset-0 z-50 bg-black" : "h-screen min-h-[500px]"
      )}
    >
      {/* Background slides with animation */}
      {/* Slides nền với animation */}
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
            {/* Main background image with optimization */}
            {/* Ảnh nền chính với tối ưu hóa */}
            <Image
              src={slide.src || "/placeholder.svg"}
              alt={slide.title}
              fill
              priority={index === 0}
              quality={index === 0 ? 75 : 60}
              sizes="(max-width: 640px) 640px, (max-width: 768px) 768px, (max-width: 1024px) 1024px, 1920px"
              className="object-cover"
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx4eHRoaHSQtJSEkMjU1LS0yMi4qLjgyPj4+ODU8PkZFRk5PT1VWV1dXV1dXV1f/2wBDAR4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh7/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
            />

            {/* Text overlay with animation */}
            {/* Lớp phủ văn bản với animation */}
            <div
              className={cn(
                "absolute top-[15%] sm:top-1/4 left-[5%] sm:left-[10%] max-w-[90%] sm:max-w-md text-white z-20 transition-all duration-500",
                isAnimating ? "opacity-0 translate-y-10" : "opacity-100 translate-y-0",
                !isTitleVisible && "opacity-0 translate-y-10 pointer-events-none"
              )}
              style={{
                transitionDelay: isAnimating ? "0ms" : "300ms",
              }}
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold mb-2 sm:mb-4 drop-shadow-lg">{slide.title}</h2>
            </div>

            {/* Main carousel with 3 images */}
            {/* Carousel chính với 3 ảnh */}
            <div className={cn(
              "absolute bottom-[5%] sm:bottom-[10%] right-[5%] sm:right-[10%] flex items-center z-10 transition-all duration-500",
              !isCarouselVisible && "opacity-0 translate-y-10 pointer-events-none"
            )}>
              {getCardImages(slide.src).map((imageSrc, cardIndex) => (
                <div
                  key={cardIndex}
                  className={cn(
                    "relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl cursor-pointer transition-all duration-700",
                    cardIndex === 0 && "h-[120px] w-[80px] sm:h-[200px] sm:w-[130px] md:h-[280px] md:w-[180px] z-10 -mr-2 sm:-mr-4 md:-mr-6",
                    cardIndex === 1 && "h-[140px] w-[90px] sm:h-[240px] sm:w-[160px] md:h-[320px] md:w-[200px] z-20 -mr-2 sm:-mr-4 md:-mr-6",
                    cardIndex === 2 && "h-[120px] w-[80px] sm:h-[200px] sm:w-[130px] md:h-[280px] md:w-[180px] z-10",
                    isAnimating && "opacity-0 translate-y-20",
                  )}
                  style={{
                    transform: `translateY(${cardIndex === 1 ? "-10px" : "0"}) ${isAnimating ? "translateY(20px)" : ""}`,
                    transitionDelay: isAnimating ? "0ms" : `${cardIndex * 200 + 400}ms`,
                    opacity: isAnimating ? 0 : 1,
                  }}
                  onClick={() => {
                    if (cardIndex === 0) prevSlide()
                    else if (cardIndex === 2) nextSlide()
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = `translateY(${cardIndex === 1 ? "-15px" : "-5px"}) scale(1.05)`
                    e.currentTarget.style.boxShadow = "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = `translateY(${cardIndex === 1 ? "-10px" : "0"})`
                    e.currentTarget.style.boxShadow = ""
                  }}
                >
                  {/* Carousel card images with optimization */}
                  {/* Ảnh card carousel với tối ưu hóa */}
                  <Image
                    src={imageSrc || "/placeholder.svg"}
                    alt={`Nature image ${cardIndex + 1}`}
                    fill
                    quality={cardIndex === 1 ? 75 : 60}
                    sizes="(max-width: 640px) 80px, (max-width: 768px) 130px, (max-width: 1024px) 180px, 200px"
                    className="object-cover"
                    placeholder="blur"
                    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx4eHRoaHSQtJSEkMjU1LS0yMi4qLjgyPj4+ODU8PkZFRk5PT1VWV1dXV1dXV1f/2wBDAR4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh7/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                    loading={cardIndex === 1 ? "eager" : "lazy"}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Navigation buttons */}
      {/* Các nút điều hướng */}
      <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 sm:gap-3 z-30">
        {/* Previous button */}
        {/* Nút trước */}
        <Button
          variant="outline"
          size="icon"
          className="bg-white/10 backdrop-blur-sm border-white text-white hover:bg-white/30 h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10"
          onClick={prevSlide}
        >
          <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
        </Button>

        {/* Next button */}
        {/* Nút tiếp */}
        <Button
          variant="outline"
          size="icon"
          className="bg-white/10 backdrop-blur-sm border-white text-white hover:bg-white/30 h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10"
          onClick={nextSlide}
        >
          <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
        </Button>

        {/* Toggle carousel visibility */}
        {/* Bật/tắt hiển thị carousel */}
        <Button
          variant="outline"
          size="icon"
          className="bg-white/10 backdrop-blur-sm border-white text-white hover:bg-white/30 h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10"
          onClick={() => setIsCarouselVisible(prev => !prev)}
        >
          {isCarouselVisible ? (
            <EyeOff className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
          ) : (
            <Eye className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
          )}
        </Button>

        {/* Toggle title visibility */}
        {/* Bật/tắt hiển thị tiêu đề */}
        <Button
          variant="outline"
          size="icon"
          className={cn(
            "bg-white/10 backdrop-blur-sm border-white text-white hover:bg-white/30 h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10",
            !isTitleVisible && "opacity-50"
          )}
          onClick={() => setIsTitleVisible(prev => !prev)}
        >
          <Text className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
        </Button>

        {/* Toggle fullscreen mode */}
        {/* Bật/tắt chế độ toàn màn hình */}
        <Button
          variant="outline"
          size="icon"
          className="bg-white/10 backdrop-blur-sm border-white text-white hover:bg-white/30 h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10"
          onClick={toggleFullscreen}
        >
          {isFullscreen ? (
            <Minimize2 className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
          ) : (
            <Maximize2 className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
          )}
        </Button>
      </div>
    </div>
  )
}
