import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useProfile } from "@/hooks/useProfile";
import { updateProfile } from "@/services/profile/profileService";
import { uploadAvatar } from "@/services/storage/avatarStorageService";
import { Upload, X } from "lucide-react";
import { useToast } from "@/hooks/useToast";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

type EditProfileModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const EditProfileModal = ({
  open,
  onOpenChange,
}: EditProfileModalProps) => {
  const { user } = useAuthSession();
  const { profile, refetch } = useProfile();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [oAuthAvatarRemoved, setOAuthAvatarRemoved] = useState(false);

  // Check if user has an avatar in OAuth
  const oAuthAvatarUrl = user?.user_metadata?.avatar_url;

  // Initialize form with profile data when modal opens or profile loads
  useEffect(() => {
    if (open && profile) {
      setFullName(profile.full_name || "");
      setUsername(profile.username || "");
      // Set preview to profile avatar or OAuth avatar
      if (profile.avatar_url) {
        setPreviewUrl(profile.avatar_url);
      } else if (oAuthAvatarUrl && !oAuthAvatarRemoved) {
        setPreviewUrl(oAuthAvatarUrl);
      } else {
        setPreviewUrl(null);
      }
      setSelectedFile(null);
      setOAuthAvatarRemoved(false);
      setError(null);
    }
  }, [open, profile, oAuthAvatarUrl, oAuthAvatarRemoved]);

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

    // When a new file is selected, it overrides the existing avatar
    setSelectedFile(file);
    setOAuthAvatarRemoved(false);
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
      setError("You must be signed in to update your profile");
      return;
    }

    setIsSubmitting(true);

    try {
      // Determine avatar URL:
      // 1. If a new file was uploaded, use that (takes precedence)
      // 2. If previewUrl is null (avatar was removed), set to null
      // 3. If profile has existing avatar_url and preview shows it, keep it
      // 4. If OAuth avatar exists and preview shows it, use it
      // 5. Otherwise, no avatar (null)
      let avatarUrl: string | null = null;

      if (selectedFile) {
        // Uploaded file takes precedence
        avatarUrl = await uploadAvatar(user.id, selectedFile);
        if (!avatarUrl) {
          setError("Failed to upload image. Please try again.");
          setIsSubmitting(false);
          return;
        }
      } else if (!previewUrl) {
        // User removed the avatar (either profile or OAuth)
        avatarUrl = null;
      } else if (profile?.avatar_url && previewUrl === profile.avatar_url) {
        // Keep existing profile avatar
        avatarUrl = profile.avatar_url;
      } else if (oAuthAvatarUrl && previewUrl === oAuthAvatarUrl) {
        // Use OAuth avatar
        avatarUrl = oAuthAvatarUrl;
      }

      const result = await updateProfile(user.id, {
        full_name: fullName.trim() || null,
        username: username.trim() || null,
        avatar_url: avatarUrl,
      });

      if (!result) {
        const errorMessage = "Failed to update profile. Please try again.";
        setError(errorMessage);
        toast({
          variant: "destructive",
          title: "Profile update failed",
          description: errorMessage,
        });
        setIsSubmitting(false);
        return;
      }

      // Refetch profile to get updated data
      await refetch();

      toast({
        variant: "success",
        title: "Profile updated!",
        description: "Your profile has been updated successfully.",
      });
      onOpenChange(false);
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <div>
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Update your profile information. You can change this anytime.
          </DialogDescription>
        </DialogHeader>

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
                  JPG, PNG or GIF. Max 1MB.
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
          </div>

          <div>
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

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-500 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </div>
    </Dialog>
  );
};
