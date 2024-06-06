

import React, { useRef, useState } from 'react'
import { GeneratePodcastProps } from '@/types'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Button } from './ui/button'
import { Loader } from 'lucide-react'
import { toast, useToast } from './ui/use-toast'
import { useAction, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { v4 as uuidv4 } from 'uuid';
import { useUploadFiles } from '@xixixao/uploadstuff/react';
import { Input } from './ui/input'

const useGeneratePodcast = ({
  setAudio, 
  voiceType, 
  voicePrompt, 
  setAudioStorageId
}: GeneratePodcastProps) => {

  const [isGenerating, setIsGenerating] = useState(false);
  
  const { toast } = useToast();

  const getPodcastAudio = useAction(api.openai.generateAudioAction)

  const getAudioUrl = useMutation(api.podcasts.getUrl);               // Obtiene la url del podcast subido (action podcast)

  const generateUploadUrl = useMutation(api.files.generateUploadUrl); // Genera una dirección de almacenaje (action file)
  const { startUpload } = useUploadFiles(generateUploadUrl);          // Sube a esa dirección el file ( action @xixixao/uploadstuff/react)

  const generatePodcast = async () => {
    setIsGenerating(true);
    setAudio('');

    if (!voicePrompt) {
      toast({
        title: "Please provide a voiceType to generate a podcast",
      })
      return setIsGenerating(false);
    }

    try {
      const response = await getPodcastAudio({
        voice: voiceType,
        input: voicePrompt
      });

      const blob = new Blob([response], { type: 'audio/mpeg' });        // Formato blob
      const fileName = `podcast-${uuidv4()}.mp3`;                       // nombre del podcast según uuid  
      const file = new File([blob], fileName, { type: 'audio/mpeg' });  // blob to File con el nombre uuid

      const uploaded = await startUpload([file]);                       // Sube a convex el file del audio del podcast
      const storageId = (uploaded[0].response as any).storageId;        // Obtenemos de dicho file subido su Id en convex

      setAudioStorageId(storageId);                                     // Establecemos el estado para audioStorageId   

      const audioUrl = await getAudioUrl({ storageId });                // Obtenemos el url del audio subido a convex
      setAudio(audioUrl!);                                              // Establece estado para Audio con dicha url  
      setIsGenerating(false);
      toast({
        title: "Podcast generated successfully",
      })

    } catch (error) {
      console.log('Error generating podcast', error)
      toast({
        title: "Error creating a podcast",
        variant: 'destructive',
      })
      setIsGenerating(false);
    }
  }

  return {
    isGenerating,
    generatePodcast,
  }
}


const GeneratePodcast = ( props: GeneratePodcastProps) => {

  const [isUploading, setIsUploading] = useState(false)

  const { isGenerating, generatePodcast } = useGeneratePodcast(props);

  return (
    <div>
      <div className="flex flex-col gap-2.5">
        <Label className="text-16 font-bold text-white-1 mt-6">
          AI Prompt to generate Podcast
        </Label>
        <Textarea 
          className="input-class font-light focus-visible:ring-offset-orange-1"
          placeholder='Provide text to generate audio'
          rows={5}
          value={props.voicePrompt}
          onChange={(e) => props.setVoicePrompt(e.target.value)}
        />
      </div>
      <div className="mt-5 w-full max-w-[200px] flex gap-x-3">
        <Button 
          type="submit" 
          className="text-16 bg-orange-1 py-4 font-bold text-white-1" 
          onClick={generatePodcast}
        >
          {isGenerating ? (
            <>
              Generating
              <Loader size={20} className="animate-spin ml-2" />
            </>
          ) : (
            'Generate'
          )}
        </Button>
      </div>
      {props.audio && (
        <audio
          controls
          src={props.audio}
          autoPlay
          className="mt-5"
          onLoadedMetadata={(e) => props.setAudioDuration(e.currentTarget.duration)}
        />
      )}
    </div>
  )
}

export default GeneratePodcast