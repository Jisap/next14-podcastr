import { ConvexError, v } from "convex/values";
import { internalMutation, query } from "./_generated/server";


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

export const updateUser = internalMutation({
  args: {
    clerkId: v.string(),
    imageUrl: v.string(),
    email: v.string(),
  },
  async handler(ctx, args) {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
      .unique();

    if (!user) {
      throw new ConvexError("User not found");
    }

    await ctx.db.patch(user._id, {
      imageUrl: args.imageUrl,
      email: args.email,
    });

    const podcast = await ctx.db
      .query("podcasts")
      .filter((q) => q.eq(q.field("authorId"), args.clerkId))
      .collect();

    await Promise.all(
      podcast.map(async (p) => {
        await ctx.db.patch(p._id, {
          authorImageUrl: args.imageUrl,
        });
      })
    );
  },
});

export const deleteUser = internalMutation({
  args: { clerkId: v.string() },
  async handler(ctx, args) {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
      .unique();

    if (!user) {
      throw new ConvexError("User not found");
    }

    await ctx.db.delete(user._id);
  },
});

export const getUserById = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
      .unique();

    if (!user) {
      throw new ConvexError("User not found");
    }

    return user;
  },
});

// función de consulta que obtiene a los usuarios ordenados por el número total de podcasts que han creado, 
// y para cada usuario, sus podcasts se ordenan por la cantidad de vistas
export const getTopUserByPodcastCount = query({
  args: {},
  handler: async (ctx, args) => {
    const user = await ctx.db.query("users").collect();                     // Consulta para obtener todos los usuarios:

    const userData = await Promise.all(                                     // Obtenemos los podcasts de cada usuario y ordenarlos por vistas:
      user.map(async (u) => {                                               // 1º se crea un array de promesas donde para cada usuario u
        const podcasts = await ctx.db                                       // Se consulta la bd de convex
          .query("podcasts")                                                // en la tabla "podcasts"
          .filter((q) => q.eq(q.field("authorId"), u.clerkId))              // para obtener los podcasts cuyo authorId coincide con u.clerkId.
          .collect();

        const sortedPodcasts = podcasts.sort((a, b) => b.views - a.views);  // Se ordenan estos podcasts por el número de vistas en orden descendente (b.views - a.views

        return {                                                            // 2º Se retorna un objeto que incluye 
          ...u,                                                             // los datos del usuario original 
          totalPodcasts: podcasts.length,                                   // el total de podcasts
          podcast: sortedPodcasts.map((p) => ({                             // y una lista de sus podcasts ordenados      
            podcastTitle: p.podcastTitle,                                   // con el título 
            podcastId: p._id,                                               // y el ID de cada podcast.
          })),
        };
      })
    );

    return userData.sort((a, b) => b.totalPodcasts - a.totalPodcasts);
  },
});