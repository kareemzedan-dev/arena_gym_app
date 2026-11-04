import { z } from "zod";

type WithoutDefault<T extends z.ZodType> = T extends
  z.ZodDefault<infer Inner> | z.ZodPrefault<infer Inner>
  ? Inner
  : T;

/** PATCH must not reactivate a plan or reset its fee when those fields are absent. */
export function partialWithoutDefaults<T extends Record<string, z.ZodType>>(
  schema: z.ZodObject<T>,
) {
  const shape = Object.fromEntries(
    Object.entries(schema.shape).map(([key, field]) => {
      const inner =
        field instanceof z.ZodDefault || field instanceof z.ZodPrefault
          ? field.unwrap()
          : field;
      return [key, z.optional(inner)];
    }),
  ) as { [K in keyof T]: z.ZodOptional<WithoutDefault<T[K]>> };
  return schema.extend(shape);
}
