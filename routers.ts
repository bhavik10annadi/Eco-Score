              message: 'Product not found',
            });
          }

          const alternatives = await findAlternatives(
            {
              barcode: product.barcode,
              name: product.name,
              brand: product.brand || undefined,
              category: product.category || undefined,
              ecoScore: product.ecoScore || 50,
              ecoScoreGrade: product.ecoScoreGrade || 'C',
              environmentalFootprint: product.environmentalFootprint || 50,
              packagingSustainability: product.packagingSustainability || 50,
              carbonImpact: product.carbonImpact || 50,
              imageUrl: product.imageUrl || undefined,
              price: product.price?.toString(),
              country: product.country || undefined,
            },
            input.minSimilarity
          );

          // Save alternatives to database
          for (const alt of alternatives) {
            await db.upsertProduct(alt);
          }

          return alternatives;
        } catch (error) {
          console.error('Error finding alternatives:', error);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to find alternatives',
          });
        }
      }),
  }),

  // Favorites procedures
  favorites: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      try {
        return await db.getUserFavorites(ctx.user.id);
      } catch (error) {
        console.error('Error fetching favorites:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch favorites',
        });
      }
    }),

    add: protectedProcedure
      .input(z.object({ productId: z.number(), notes: z.string().optional() }))
      .mutation(async ({ ctx, input }) => {
        try {
          const id = await db.addFavorite(ctx.user.id, input.productId, input.notes);
          return { success: true, id };
        } catch (error) {
          console.error('Error adding favorite:', error);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to add favorite',
          });
        }
      }),

    remove: protectedProcedure
      .input(z.object({ productId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        try {
          await db.removeFavorite(ctx.user.id, input.productId);
          return { success: true };
        } catch (error) {
          console.error('Error removing favorite:', error);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to remove favorite',
          });
        }