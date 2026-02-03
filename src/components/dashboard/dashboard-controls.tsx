"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DashboardControlsProps {
  type: "tasks" | "notes";
}

export function DashboardControls({ type }: DashboardControlsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Keys
  const tabValue = type;
  const searchKey = type === "tasks" ? "q" : "nq";
  const sortKey = type === "tasks" ? "t_sort" : "n_sort";
  const filterKey = type === "tasks" ? "t_status" : "n_type";

  // Read current values
  const currentSearch = searchParams.get(searchKey) ?? "";
  const currentSort = searchParams.get(sortKey) ?? "newest";
  const currentFilter = searchParams.get(filterKey) ?? "all";

  // Controlled input state
  const [searchValue, setSearchValue] = useState(currentSearch);
  useEffect(() => {
    // URL değişirse input’u senkronla (back/forward veya tab switch)
    setSearchValue(currentSearch);
  }, [currentSearch]);

  // Helper: set param while preserving others + keep tab in URL
  const setParam = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    // always keep tab
    params.set("tab", tabValue);

    if (value === "" || value === "all") params.delete(name);
    else params.set(name, value);

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  // Debounce timer
  const timerRef = useRef<number | null>(null);

  const onSearchChange = (val: string) => {
    setSearchValue(val);
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      setParam(searchKey, val.trim());
    }, 300);
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6 p-4 bg-muted/20 rounded-lg border">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={`Search ${type}...`}
          className="pl-8 bg-background"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          disabled={isPending}
        />
      </div>

      <div className="flex gap-2">
        <Select
          value={currentSort}
          onValueChange={(v) => setParam(sortKey, v)}
          disabled={isPending}
        >
          <SelectTrigger className="w-[130px] bg-background">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="oldest">Oldest</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={currentFilter}
          onValueChange={(v) => setParam(filterKey, v)}
          disabled={isPending}
        >
          <SelectTrigger className="w-[140px] bg-background">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {type === "tasks" ? (
              <>
                <SelectItem value="TODO">To Do</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="DONE">Done</SelectItem>
                <SelectItem value="ARCHIVED">Archived</SelectItem>
              </>
            ) : (
              <>
                <SelectItem value="technical">Technical</SelectItem>
                <SelectItem value="non_technical">General</SelectItem>
              </>
            )}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
