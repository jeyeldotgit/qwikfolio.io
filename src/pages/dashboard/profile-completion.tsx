import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuthSession } from "@/hooks/useAuthSession";
import {
  createProfile,
  updateProfile,
  getProfile,
} from "@/services/profile/profileService";
import { hasCompletedOnboarding } from "@/services/auth/supabase-auth";
import { uploadAvatar } from "@/services/storage/avatarStorageService";
import { Upload, X } from "lucide-react";
import { useToast } from "@/hooks/useToast";

const ProfileCompletionPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthSession();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [oAuthAvatarRemoved, setOAuthAvatarRemoved] = useState(false);
  const [isOnboardingCompleted, setIsOnboardingCompleted] = useState<
    boolean | null
  >(null);

  // Check if user has completed onboarding
  useEffect(() => {
    if (user?.id) {
      hasCompletedOnboarding(user.id).then((completed) => {
        setIsOnboardingCompleted(completed);
      });
    }
  }, [user?.id]);

  // If onboarding is already completed, redirect to dashboard
  if (isOnboardingCompleted) {
    navigate("/dashboard");
  }

  // Check if user has an avatar in OAuth
  const oAuthAvatarUrl = user?.user_metadata?.avatar_url;
  const oAuthDisplayName = user?.user_metadata?.full_name;

  // Initialize preview with OAuth avatar if available and not removed
  useEffect(() => {
    if (
      oAuthAvatarUrl &&
      !oAuthAvatarRemoved &&
      !selectedFile &&
      oAuthDisplayName
    ) {
      setPreviewUrl(oAuthAvatarUrl);
      setFullName(oAuthDisplayName);
    }
  }, [oAuthAvatarUrl, oAuthAvatarRemoved, selectedFile, oAuthDisplayName]);
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    // Validate file size (max 1MB)
    if (file.size > 1 * 1024 * 1024) {
      setError("Image must be smaller than 1MB");
      return;
    }

    // When a new file is selected, it overrides the OAuth avatar
    setSelectedFile(file);
    setOAuthAvatarRemoved(false); // Reset this since we're using a new file
    setError(null);

    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setOAuthAvatarRemoved(true);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!user?.id) {
      setError("You must be signed in to complete your profile");
      return;
    }

    setIsSubmitting(true);

    try {
      // Determine avatar URL:
      // 1. If a new file was uploaded, use that (takes precedence)
      // 2. If OAuth avatar exists and wasn't removed, use that
      // 3. Otherwise, no avatar (null)
      let avatarUrl: string | null = null;

      if (selectedFile) {
        // Uploaded file takes precedence
        avatarUrl = await uploadAvatar(user.id, selectedFile);
        if (!avatarUrl) {
          setError("Failed to upload image. Please try again.");
          setIsSubmitting(false);
          return;
        }
      } else if (oAuthAvatarUrl && !oAuthAvatarRemoved) {
        // Use OAuth avatar if it exists and wasn't removed
        avatarUrl = oAuthAvatarUrl;
      }
      // If both are null/removed, avatarUrl stays null (no avatar)

      // Check if profile exists
      const existingProfile = await getProfile(user.id);

      const result = existingProfile
        ? await updateProfile(user.id, {
            full_name: fullName.trim() || null,
            username: username.trim() || null,
            avatar_url: avatarUrl,
            onboarding_completed: true,
          })
        : await createProfile(user.id, {
            full_name: fullName.trim() || null,
            username: username.trim() || null,
            avatar_url: avatarUrl,
            onboarding_completed: true,
            plan: "free",
            last_seen_at: new Date().toISOString(),
          });

      if (!result) {
        const errorMessage = "Failed to save profile. Please try again.";
        setError(errorMessage);
        toast({
          variant: "destructive",
          title: "Profile update failed",
          description: errorMessage,
        });
        setIsSubmitting(false);
        return;
      }

      toast({
        variant: "success",
        title: "Profile completed!",
        description: "Your profile has been saved successfully.",
      });
      navigate("/dashboard");
    } catch (err) {
      const errorMessage = "An error occurred. Please try again.";
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-6 sm:p-8">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
            Complete your profile
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Add a few details so your QwikFolio feels personal. You can change
            this later.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="avatar"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
            >
              Profile picture (optional)
            </label>
            <div className="flex items-center gap-4">
              {previewUrl ? (
                <div className="relative">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="h-20 w-20 rounded-full object-cover border-2 border-slate-300 dark:border-slate-700"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                    aria-label="Remove image"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <div className="h-20 w-20 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-700">
                  <Upload className="h-6 w-6 text-slate-400" />
                </div>
              )}
              <div className="flex-1">
                <input
                  ref={fileInputRef}
                  id="avatar"
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs"
                >
                  {previewUrl ? "Change picture" : "Upload picture"}
                </Button>
                <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                  JPG, PNG or GIF. Max 5MB.
                </p>
              </div>
            </div>
          </div>

          <div>
            <label
              htmlFor="fullName"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
            >
              Full name
            </label>
            <input
              id="fullName"
              type="text"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
              placeholder="Alex Developer"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
            />
            <label
              htmlFor="username"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
              placeholder="alex_developer"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
            />
          </div>

          {error ? (
            <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
          ) : null}

          <Button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-sm h-10"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Continue to dashboard"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ProfileCompletionPage;
