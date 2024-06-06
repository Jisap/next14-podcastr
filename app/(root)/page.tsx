'use client'

import React from 'react'
import PodcastCard from '@/components/PodcastCard'
import { podcastData } from '@/constants'
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import LoaderSpinner from '@/components/LoaderSpinner';

const Home = () => {

  const trendingPodcasts = useQuery(api.podcasts.getTrendingPodcasts); // Cambiar por podcastData

  if (!trendingPodcasts) return <LoaderSpinner />

  return (
    <div className='mt-9 flex flex-col gap-9'>
      <section className='flex flex-col gap-5'>
        <h1 className='text-20 font-bold text-white-1'>Trending Podcast</h1>
        
        <div className="podcast_grid">
            {podcastData.map(({ id, title, description, imgURL }) => (
              <PodcastCard
                key={id}
                imgUrl={imgURL as string}
                title={title}
                description={description}
                podcastId={id}
              />
            ))}
          </div>
      </section>
    </div>
  )
}

export default Home