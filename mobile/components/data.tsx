import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { api } from "../api";
import { Loading, Failure } from "./ui";
export function useData<S extends z.ZodTypeAny>(
  path: string,
  schema: S,
  enabled = true,
) {
  return useQuery({
    queryKey: ["api", path],
    queryFn: () => api.request(path, schema),
    enabled,
  });
}
export function useSave<S extends z.ZodTypeAny>(
  path: string,
  schema: S,
  method = "POST",
  done?: (data: z.output<S>) => void,
) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (value: unknown) =>
      api.request(path, schema, { method, body: JSON.stringify(value) }),
    onSuccess: (data) => {
      void client.invalidateQueries({ queryKey: ["api"] });
      done?.(data);
    },
  });
}
export function DataState({
  query,
  children,
}: React.PropsWithChildren<{
  query: { isPending: boolean; error: unknown; refetch(): unknown };
}>) {
  if (query.isPending) return <Loading />;
  if (query.error)
    return (
      <Failure
        error={query.error}
        retry={() => {
          void query.refetch();
        }}
      />
    );
  return <>{children}</>;
}
