import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import type { WebhookEvent } from "@clerk/backend";
import { Webhook } from "svix";


const handleClerkWebhook = httpAction(async (ctx, request) => {   // Aquí se llega cuando el usuario se autentica en clerk 
  
  const event = await validateRequest(request);                   // Se recibe el evento de autenticación y valida su autenticidad
  if (!event) {
    return new Response("Error occured", {
      status: 400,
    });
  }
  switch (event.type) {                                           // Si el evento es de creación de usuario  
    case "user.created":                                          // se invoca la mutación de users.ts "createUser"
      await ctx.runMutation(internal.users.createUser, {
        clerkId: event.data.id,
        email: event.data.email_addresses[0].email_address,
        imageUrl: event.data.image_url,
        name: event.data.first_name!,
      })
      break;
    case "user.updated":
      await ctx.runMutation(internal.users.updateUser, {
        clerkId: event.data.id,
        imageUrl: event.data.image_url,
        email: event.data.email_addresses[0].email_address,
      });
      break;
    case "user.deleted":
      await ctx.runMutation(internal.users.deleteUser, {
        clerkId: event.data.id as string,
      });
      break;
    default: {
      console.log("ignored Clerk webhook event", event.type);
    }
  }
  return new Response(null, {
    status: 200,
  });
});

const http = httpRouter();              // Enrutador http para manejar solicitudes post(create/update/delete) de users usando hendleClerkWebhook     

http.route({                            // Cuando Clerk envía un webhook            
  path: "/clerk",                       // a la ruta configurada por convex terminada en /clerk
  method: "POST",                       // tipo post
  handler: handleClerkWebhook,          // httprouter lo redirige al manejador handleClerkWebhook -> validación webhook -> mutaciones en bd   
});

const validateRequest = async (
  req: Request
): Promise<WebhookEvent | undefined> => {

  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET!;
  if (!webhookSecret) {
    throw new Error("CLERK_WEBHOOK_SECRET is not defined");
  }
  const payloadString = await req.text();
  const headerPayload = req.headers;
  const svixHeaders = {
    "svix-id": headerPayload.get("svix-id")!,
    "svix-timestamp": headerPayload.get("svix-timestamp")!,
    "svix-signature": headerPayload.get("svix-signature")!,
  };
  const wh = new Webhook(webhookSecret);
  const event = wh.verify(payloadString, svixHeaders);
  return event as unknown as WebhookEvent;
};

export default http;