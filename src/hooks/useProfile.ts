import { useState, useEffect } from "react";
import { getProfile } from "@/services/profile/profileService";
import type { Profile } from "@/schemas/profile";
import { useAuthSession } from "./useAuthSession";

type UseProfileResult = {
  profile: Profile | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

export const useProfile = (): UseProfileResult => {
  const { user } = useAuthSession();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    if (!user?.id) {
      setProfile(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const data = await getProfile(user.id);

    if (data) {
      setProfile(data);
    } else {
      setError("Failed to load profile");
    }

    setIsLoading(false);
  };

  useEffect(() => {
    fetchProfile();
  }, [user?.id]);

  return {
    profile,
    isLoading,
    error,
    refetch: fetchProfile,
  };
};
