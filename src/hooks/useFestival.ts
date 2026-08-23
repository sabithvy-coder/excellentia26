import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Festival = {
  id: string;
  year: number;
  title: string;
  tagline: string | null;
  status: string;
  is_current: boolean;
  created_at: string;
};

export const useFestivals = () =>
  useQuery({
    queryKey: ["festivals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("festivals")
        .select("*")
        .order("year", { ascending: false });
      if (error) throw error;
      return data as Festival[];
    },
    staleTime: 5 * 60 * 1000,
  });

/** The festival currently running — everything on the public site defaults to this. */
export const useCurrentFestival = () =>
  useQuery({
    queryKey: ["festival", "current"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("festivals")
        .select("*")
        .eq("is_current", true)
        .maybeSingle();
      if (error) throw error;
      return (data as Festival) ?? null;
    },
    staleTime: 5 * 60 * 1000,
  });

export const useFestivalByYear = (year?: number) =>
  useQuery({
    queryKey: ["festival", "year", year],
    enabled: !!year,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("festivals")
        .select("*")
        .eq("year", year!)
        .maybeSingle();
      if (error) throw error;
      return (data as Festival) ?? null;
    },
    staleTime: 5 * 60 * 1000,
  });

/**
 * Resolves the festival a page should show:
 * an explicit id (archive pages) or the current festival (live site).
 */
export const useResolvedFestivalId = (explicitId?: string) => {
  const { data: current, isLoading } = useCurrentFestival();
  return {
    festivalId: explicitId ?? current?.id,
    current,
    isLoading: explicitId ? false : isLoading,
  };
};
