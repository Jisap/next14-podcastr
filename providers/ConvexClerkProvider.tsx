'use client'

import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";
import { ReactNode } from "react";

// Clerk se encarga de autenticar a los usuarios, mientras que Convex utiliza esa información de autenticación para controlar el acceso a los datos

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL as string);           // Aquí se crea una instancia de ConvexReactClient

const ConvexClerkProvider =({ children }: { children: ReactNode }) => (

  //ClerkProvider maneja la autenticación
  <ClerkProvider 
    publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY as string}
    appearance={{
      layout: {
        socialButtonsVariant: 'iconButton',
        logoImageUrl: '/icons/auth-logo.svg'
      },
      variables: {
        colorBackground: '#15171c',
        colorPrimary: '',
        colorText: 'white',
        colorInputBackground: '#1b1f29',
        colorInputText: 'white',
      }
    }}  
  >   
    
    {/* Cuando se loguea en clerk el usuario, useAuth nos permite acceder al resto de las rutas */}
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      { children }
    </ConvexProviderWithClerk>
  </ClerkProvider>
  
)

export default ConvexClerkProvider