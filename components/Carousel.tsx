import React, { useCallback } from 'react'
import { EmblaOptionsType, EmblaCarouselType } from 'embla-carousel'
import { DotButton, useDotButton } from './EmblaCarouselDotButton'
import Autoplay from 'embla-carousel-autoplay'
import useEmblaCarousel from 'embla-carousel-react'
import { CarouselProps } from '@/types'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import LoaderSpinner from './LoaderSpinner'

const EmblaCarousel = ({ fansLikeDetail }: CarouselProps) => { // Se reciben los topPodcasters

  const router = useRouter();

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Autoplay()]);  // Inicializa el carrusel con la opción de loop (repetición continua) y el plugin Autoplay (auto-reproducción).

  // Función de callback que maneja la interacción con los botones de navegación.

  const onNavButtonClick = useCallback((emblaApi: EmblaCarouselType) => {       // La función toma emblaApi como argumento, que es la API del carrusel Embla.      
    const autoplay = emblaApi?.plugins()?.autoplay                              // Se accede a los plugins del carrusel a través de emblaApi.plugins(), y luego se obtiene el plugin de autoplay si está presente (?.autoplay).
    if (!autoplay || !("stopOnInteraction" in autoplay.options)) return         // Si el plugin de autoplay no está presente (!autoplay), o si la opción stopOnInteraction no está definida en las opciones del plugin (!("stopOnInteraction" in autoplay.options)), la función simplemente retorna y no hace nada.

    const resetOrStop =
      autoplay.options.stopOnInteraction === false                              // Aquí se determina si se debe reiniciar (reset) o detener (stop) el autoplay basándose en la configuración stopOnInteraction
        ? (autoplay.reset as () => void)                                        // Si stopOnInteraction es false, se debe reiniciar el autoplay (autoplay.reset).
        : (autoplay.stop as () => void)                                         // Si stopOnInteraction es true, se debe detener el autoplay (autoplay.stop).


    resetOrStop()                                                               // Se ejecuta la acción determinada en el paso anterior: ya sea reiniciar o detener el autoplay.
  }, [])

  const { selectedIndex, scrollSnaps, onDotButtonClick } = useDotButton(        // Hook personalizado que gestiona el estado de los botones de navegación (puntos) del carrusel.
    emblaApi,
    onNavButtonClick
  )

  const slides = fansLikeDetail && fansLikeDetail?.filter((item: any) => item.totalPodcasts > 0) // Filtra fansLikeDetail para incluir solo los elementos con más de 0 podcasts y verifica si hay datos disponibles.

  if (!slides) return <LoaderSpinner />                                                          // Si no hay, muestra un componente de carga(LoaderSpinner). 

  return (
    <section className="flex w-full flex-col gap-4 overflow-hidden" ref={emblaRef}>
      <div className="flex">
        {slides.slice(0, 5).map((item) => (  // Renderiza un div que contiene hasta 5 elementos del carrusel.
          <figure
            key={item._id}
            className="carousel_box"
            onClick={() => router.push(`/podcasts/${item.podcast[0]?.podcastId}`)}
          >
            <Image
              src={item.imageUrl}
              alt="card"
              fill
              className="absolute size-full rounded-xl border-none"
            />
            <div className="glassmorphism-black relative z-10 flex flex-col rounded-b-xl p-4">
              <h2 className="text-14 font-semibold text-white-1">{item.podcast[0]?.podcastTitle}</h2>
              <p className="text-12 font-normal text-white-2">{item.name}</p>
            </div>
          </figure>
        ))}
      </div>
      <div className="flex justify-center gap-2">
        {scrollSnaps.map((_, index) => ( // Renderiza botones de navegación (puntos), usando el componente DotButton.
          <DotButton
            key={index}
            onClick={() => onDotButtonClick(index)}
            selected={index === selectedIndex}
          />
        ))}
      </div>
    </section>
  )
}

export default EmblaCarousel