import React, { useRef, useState } from 'react'
import { GeneratePodcastProps, GenerateThumbnailProps } from '../types/index';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { useAction, useMutation } from 'convex/react';
import { useUploadFiles } from '@xixixao/uploadstuff/react';
import { api } from '@/convex/_generated/api';
import { toast } from './ui/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { Loader } from 'lucide-react';
import { Input } from './ui/input';
import Image from 'next/image';

const GeneratePodcastUploaded = ({
  audio,
  setAudio,
  voiceType,
  voicePrompt,
  setAudioStorageId,
  setAudioDuration,
}: GeneratePodcastProps) => {

  const podcastRef = useRef<HTMLInputElement>(null);

  const [isPodcastLoading, setIsPodcastLoading] = useState(false);

  const getAudioUrl = useMutation(api.podcasts.getUrl);                         // Obtiene la url de la imagen subida (usamos la misma action podcast para obtenerla)

  const generateUploadUrl = useMutation(api.files.generateUploadUrl);           // Genera una dirección de almacenaje (action file)
  const { startUpload } = useUploadFiles(generateUploadUrl);                    // Sube a esa dirección el file (action @xixixao/uploadstuff/react)


  const handlePodcastUpload = async (blob: Blob, fileName: string) => {         // handleImage recibe el archivo de la imagen en formato blob

    setIsPodcastLoading(true);
    setAudio('');

    try {
      const file = new File([blob], fileName, { type: 'audio/mpeg' });           // Blob se transforma a File 

      const uploaded = await startUpload([file]);                               // Se sube a convex 
      const storageId = (uploaded[0].response as any).storageId;                // Se obtiene el id del file en convex 

      setAudioStorageId(storageId);

      const audioUrl = await getAudioUrl({ storageId });                        // Obtiene la url de la imagen subida (se usa la misma action de podcast)
      setAudio(audioUrl!);
      setIsPodcastLoading(false);
      toast({
        title: "Podcast uploaded successfully",
      })
    } catch (error) {
      console.log(error)
      toast({ title: 'Error generating podcast', variant: 'destructive' })
    }
  }

  const uploadPodcast = async (e: React.ChangeEvent<HTMLInputElement>) => {       // Esta función sube el podcast particular del usuario a convex
    e.preventDefault();

    try {
      const files = e.target.files;
      if (!files) return;
      const file = files[0];
      const blob = await file.arrayBuffer()
        .then((ab) => new Blob([ab]));

      handlePodcastUpload(blob, file.name);                                        // handlePodcastUpload -> blob -> File -> upload Convex -> Id -> imageUrl -> image
    } catch (error) {
      console.log(error)
      toast({ title: 'Error uploading podcast', variant: 'destructive' })
    }
  }

  return (
    <>
      <div className='flex flex-col border-b border-black-5 pb-8'>
      
        <div className="w-full max-w-[5200px] flex gap-x-3">

          {!isPodcastLoading ? (
            <div className='image_div'
              onClick={() => podcastRef?.current?.click()}
            >
              <Input
                type="file"
                className="hidden"
                ref={podcastRef}
                onChange={(e) => uploadPodcast(e)}
              />
              {!isPodcastLoading ? (
                <Image src="/icons/upload-image.svg" width={40} height={40} alt="upload" />
              ) : (
                <div className="text-16 flex-center font-medium text-white-1">
                  Uploading
                  <Loader size={20} className="animate-spin ml-2" />
                </div>
              )}
              <div className="flex flex-col items-center gap-1">
                <h2 className="text-12 font-bold text-orange-1">
                  Click to upload
                </h2>
                <p className="text-12 font-normal text-gray-1">Audio</p>
              </div>
            </div>

          ) : (
            <p>hello</p>
          )}
          {/* <Button 
            type="button"
            onClick={() => podcastRef?.current?.click()}
            className="text-16 bg-orange-1 py-4 font-bold text-white-1" 
          >   
            <>
              <Input                                                    
                type="file"
                className="hidden"
                ref={podcastRef}
                onChange={(e) => uploadPodcast(e)}
                />
          
            {isPodcastLoading ? (
                <>
                  Uploading
                  <Loader size={20} className="animate-spin ml-2" />
                </>
              ) : (
                'Upload'
                )}
            </>                                                 
          </Button>   */}
          </div>
      </div>
      
      {/* {audio && (
        <audio
          controls
          src={audio}
          autoPlay
          className="mt-5"
          onLoadedMetadata={(e) => setAudioDuration(e.currentTarget.duration)}
        />
      )} */}
    </>
  )
}

export default GeneratePodcastUploaded