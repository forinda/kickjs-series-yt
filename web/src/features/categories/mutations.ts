import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { api } from "@/lib/api";
import { categoryKeys } from "./keys";

// Mirrors server/src/modules/category/dtos/create-category.dto.ts
export const CATEGORY_LIMITS = { name: 50, description: 280 } as const;

export const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(CATEGORY_LIMITS.name, `Name must be at most ${CATEGORY_LIMITS.name} characters`),
  description: z
    .string()
    .trim()
    .min(10, "Description must be at least 10 characters")
    .max(
      CATEGORY_LIMITS.description,
      `Description must be at most ${CATEGORY_LIMITS.description} characters`,
    ),
});

export type CategoryInput = z.infer<typeof categorySchema>;

export const useSaveCategory = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...body }: CategoryInput & { id?: string }) =>
      id ? api.put("/categories/:id", { params: { id }, body }) : api.post("/categories", { body }),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: categoryKeys.all });
    },
  });
};
