import { cn, getDisplayName } from "@/lib/utils";
import Avatar from "./avatar";

export function FriendCard({ 
  email, 
  firstName, 
  lastName,
  children 
}: { 
  email: string; 
  firstName?: string; 
  lastName?: string; 
  children?: React.ReactNode 
}) {
  const displayName = getDisplayName(firstName, lastName) || email;

  return (
    <div className="rounded-3xl bg-secondary p-2 space-y-2">
      <div className="flex items-center justify-center aspect-square">
        {children}
      </div>
      <div className="flex items-center flex-wrap gap-2">
        <Avatar size={32} firstName={firstName} lastName={lastName} email={email} style={!displayName ? "shape" : "character"} />
        <p className={cn("font-medium text-sm", {
          "text-muted-foreground": !displayName,
        })}>{displayName || "--"}</p>
      </div>
    </div>
  );
}

export function FriendGallery({ children }: { children?: React.ReactNode }) {
  return (
    <div className="grid grid-cols-2 gap-1">
      {children}
    </div>
  );
}