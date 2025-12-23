import { useState } from "react";
import { LogOut, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProfile } from "@/hooks/useProfile";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

type ProfileMenuProps = {
  displayName?: string | null;
  onEditProfile: () => void;
  onLogout: () => void;
};

const getInitials = (name?: string | null): string => {
  if (!name) return "U";
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0]!.charAt(0).toUpperCase();
  return (
    parts[0]!.charAt(0).toUpperCase() +
    parts[parts.length - 1]!.charAt(0).toUpperCase()
  );
};

export const ProfileMenu = ({
  displayName,
  onEditProfile,
  onLogout,
}: ProfileMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const initials = getInitials(displayName);
  const { profile } = useProfile();
  const avatarUrl = profile?.avatar_url ?? initials;

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  const handleEditProfileClick = () => {
    setIsOpen(false);
    onEditProfile();
  };

  const handleLogoutClick = () => {
    setIsOpen(false);
    onLogout();
  };

  return (
    <div className="relative">
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="h-9 w-9 rounded-full border-slate-300 bg-slate-100 text-xs font-semibold text-slate-700 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
        onClick={handleToggle}
        aria-label="Open profile menu"
      >
        <Avatar>
          <AvatarImage src={avatarUrl} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      </Button>

      {isOpen ? (
        <div className="absolute right-0 mt-2 w-40 rounded-md border border-slate-200 bg-white py-1 text-sm shadow-lg dark:border-slate-700 dark:bg-slate-900">
          {displayName ? (
            <div className="px-3 pb-1 pt-1 text-[11px] text-slate-500 dark:text-slate-400">
              Signed in as
              <div className="truncate font-medium text-slate-800 dark:text-slate-100">
                {displayName}
              </div>
            </div>
          ) : null}
          <button
            type="button"
            className="flex w-full items-center px-3 py-1.5 text-left text-slate-700 hover:bg-slate-50 dark:text-slate-100 dark:hover:bg-slate-800"
            onClick={handleEditProfileClick}
          >
            <Settings className="mr-2 h-3.5 w-3.5" />
            <span className="text-xs">Edit profile</span>
          </button>
          <button
            type="button"
            className="flex w-full items-center px-3 py-1.5 text-left text-slate-700 hover:bg-slate-50 dark:text-slate-100 dark:hover:bg-slate-800"
            onClick={handleLogoutClick}
          >
            <LogOut className="mr-2 h-3.5 w-3.5" />
            <span className="text-xs">Log out</span>
          </button>
        </div>
      ) : null}
    </div>
  );
};
