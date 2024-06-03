import { v } from "convex/values";
import { internalMutation } from "./_generated/server";


export const createUser = internalMutation({ // Crea un usuario en el entorno de la bd de convex
  args: {
    clerkId: v.string(),
    email: v.string(),
    imageUrl: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {   // ctx es el entorno que proporciona acceso a la base de datos y otras funcionalidades de la plataforma Convex durante la ejecución de una mutación.
    await ctx.db.insert("users", {
      clerkId: args.clerkId,
      email: args.email,
      imageUrl: args.imageUrl,
      name: args.name,
    });
  },
});