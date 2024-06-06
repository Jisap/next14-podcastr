import React, { useRef, useState } from 'react'
import { GenerateThumbnailProps } from '../types/index';
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

const GenerateThumbnail = ({ 
  setImage, 
  setImageStorageId, 
  image, 
  imagePrompt, 
  setImagePrompt }: GenerateThumbnailProps) => {

  const imageRef = useRef<HTMLInputElement>(null);  

  const [isAiThumbnail, setIsAiThumbnail] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);  

  const getImageUrl = useMutation(api.podcasts.getUrl);                         // Obtiene la url de la imagen subida (usamos la misma action podcast para obtenerla)

  const generateUploadUrl = useMutation(api.files.generateUploadUrl);           // Genera una dirección de almacenaje (action file)
  const { startUpload } = useUploadFiles(generateUploadUrl);                    // Sube a esa dirección el file (action @xixixao/uploadstuff/react)
  const handleGenerateThumbnail = useAction(api.openai.generateThumbnailAction) // Utilizamos la action de openai para generar la imagen
 

  const handleImage = async (blob: Blob, fileName: string) => {                 // handleImage recibe el archivo de la imagen en formato blob
    
    setIsImageLoading(true);
    setImage('');

    try {
      const file = new File([blob], fileName, { type: 'image/png' });           // Blob se transforma a File 

      const uploaded = await startUpload([file]);                               // Se sube a convex 
      const storageId = (uploaded[0].response as any).storageId;                // Se obtiene el id del file en convex 

      setImageStorageId(storageId);

      const imageUrl = await getImageUrl({ storageId });                        // Obtiene la url de la imagen subida (se usa la misma action de podcast)
      setImage(imageUrl!);
      setIsImageLoading(false);
      toast({
        title: "Thumbnail generated successfully",
      })
    } catch (error) {
      console.log(error)
      toast({ title: 'Error generating thumbnail', variant: 'destructive' })
    }
  }

  const generateImage = async () => {
    try {
      const response = await handleGenerateThumbnail({ prompt: imagePrompt });  // Peticion a openai de generación de la imagen según prompt
      const blob = new Blob([response], { type: 'image/png' });                 // La respuesta es en formato blob -> handleImage       
      handleImage(blob, `thumbnail-${uuidv4()}`);                               // blob -> File -> upload Convex -> Id -> imageUrl -> image  
    } catch (error) {
      console.log(error)
      toast({ title: 'Error generating thumbnail', variant: 'destructive' })
    }
  }

  const uploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {       // Esta función sube el podcast particular del usuario a convex
    e.preventDefault();

    try {
      const files = e.target.files;
      if (!files) return;
      const file = files[0];
      const blob = await file.arrayBuffer()
        .then((ab) => new Blob([ab]));

      handleImage(blob, file.name);                                             // handleImage -> blob -> File -> upload Convex -> Id -> imageUrl -> image
    } catch (error) {
      console.log(error)
      toast({ title: 'Error uploading image', variant: 'destructive' })
    }
  }

  return (
    <>
      <div className="generate_thumbnail ">
        <Button                                                                 // Boton para generar una imagen con openai
          type="button"
          variant="plain"
          onClick={() => setIsAiThumbnail(true)}
          className={cn('', {
            'bg-black-6': isAiThumbnail
          })}
        >
          Use AI to generate thumbnail
        </Button>
        <Button                                           // Boton para subir una imagen particular
          type="button"
          variant="plain"
          onClick={() => setIsAiThumbnail(false)}
          className={cn('', {
            'bg-black-6': !isAiThumbnail
          })}
        >
          Upload custom image
        </Button>
      </div>

      {isAiThumbnail ? (                                              // Si se pulso generar una imagen con openai se muestra textArea + button
        <div className="flex flex-col gap-5">
          
          <div className="mt-5 flex flex-col gap-2.5">
            <Label className="text-16 font-bold text-white-1">
              AI Prompt to generate Thumbnail
            </Label>
            <Textarea
              className="input-class font-light focus-visible:ring-offset-orange-1"
              placeholder='Provide text to generate thumbnail'
              rows={5}
              value={imagePrompt}
              onChange={(e) => setImagePrompt(e.target.value)}
            />
          </div>

          <div className='w-full max-w-[200px]'>
            <Button 
              type="submit" 
              className="text-16 bg-orange-1 py-4 font-bold text-white-1" 
              onClick={generateImage}
            >
              {isImageLoading ? (
                <>
                  Generating
                  <Loader size={20} className="animate-spin ml-2" />
                </>
              ) : (
                'Generate'
              )}
            </Button>
          </div>
        </div>
      ) : (
          <div                                                        // Si se pulso subir una imagen particular
            className="image_div" 
            onClick={() => imageRef?.current?.click()}
          >
            <Input                                                    // se muestra una zona para subir imagenes
              type="file"
              className="hidden"
              ref={imageRef}
              onChange={(e) => uploadImage(e)}
            />
            {!isImageLoading ? (
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
              <p className="text-12 font-normal text-gray-1">SVG, PNG, JPG, or GIF (max. 1080x1080px)</p>
            </div>
          </div>
      )}
      {image && (                                                   // Al final se muestra la imagen generada o subida
        <div className="flex-center w-full">
          <Image
            src={image}
            width={200}
            height={200}
            className="mt-5"
            alt="thumbnail"
          />
        </div>
      )}
    </>
  )
}

export default GenerateThumbnail