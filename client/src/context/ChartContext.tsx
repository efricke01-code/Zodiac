import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { NatalChart, BirthInput } from "../api/types";

interface StoredProfile {
  chart: NatalChart;
  timezone: string;
  place: string | null;
  birthInput: BirthInput;
  label: string;
}

interface ChartContextValue {
  profile: StoredProfile | null;
  setProfile: (profile: StoredProfile) => void;
  clearProfile: () => void;
}

const ChartContext = createContext<ChartContextValue | null>(null);
const STORAGE_KEY = "zodiac.profile";

export function ChartProvider({ children }: { children: ReactNode }) {
  const [profile, setProfileState] = useState<StoredProfile | null>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as StoredProfile) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (profile) localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  }, [profile]);

  const setProfile = (p: StoredProfile) => setProfileState(p);
  const clearProfile = () => {
    localStorage.removeItem(STORAGE_KEY);
    setProfileState(null);
  };

  return (
    <ChartContext.Provider value={{ profile, setProfile, clearProfile }}>
      {children}
    </ChartContext.Provider>
  );
}

export function useChartProfile() {
  const ctx = useContext(ChartContext);
  if (!ctx) throw new Error("useChartProfile must be used within ChartProvider");
  return ctx;
}

export type { StoredProfile };
