"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useParams } from "next/navigation";
import { Guard } from "@/app/types/guard";
import ViewGuardTopCard from "@/components/guard/view-guard-top-card";
import ViewGuardContent from "@/components/guard/view-guard-content";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { fetchGuard } from "@/store/slices/guardSlice";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function GuardDetailsPage() {
  const searchParams = useSearchParams();
  const params = useParams();
  const dispatch = useAppDispatch();
  const guardId = Number(params.id);
  const [guard, setGuard] = useState<Guard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);

      const guardParam = searchParams.get("guard");
      if (guardParam) {
        try {
          const decoded = JSON.parse(decodeURIComponent(guardParam)) as Guard;
          if (!cancelled) setGuard(decoded);
        } catch {
          // fall through to API
        }
      }

      if (!guardId || Number.isNaN(guardId)) {
        if (!cancelled) {
          setLoading(false);
          setError("Invalid officer id.");
        }
        return;
      }

      try {
        const result = await dispatch(
          fetchGuard({
            id: guardId,
            params: { include: ["profile", "documents", "guard_type"] },
          })
        ).unwrap();

        // Normalize profile_data from profile for older view components.
        const resultWithProfile = result as Guard & {
          profile?: Guard["profile_data"];
        };
        const normalized: Guard = {
          ...result,
          profile_data:
            resultWithProfile.profile_data ??
            resultWithProfile.profile ??
            undefined,
        };

        if (!cancelled) setGuard(normalized);
      } catch (e: any) {
        if (!cancelled && !guardParam) {
          setError(e || "Officer not found.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [dispatch, guardId, searchParams]);

  if (loading && !guard) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!guard) {
    return (
      <div className="space-y-3 py-10 text-center">
        <h2 className="text-xl font-semibold">Officer not found</h2>
        <p className="text-gray-600">{error || "Could not load this officer."}</p>
        <Button asChild variant="outline">
          <Link href="/guards">Back to officers</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col h-full">
      <div className="@container/main flex flex-1 flex-col gap-2 h-full">
        <div className="pt-6 px-4 md:px-6">
          <ViewGuardTopCard guard={guard} />
        </div>
        <div className="py-2 px-4 md:px-6">
          <ViewGuardContent guard={guard} />
        </div>
      </div>
    </div>
  );
}
