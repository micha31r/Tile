import { cn, getDisplayName } from "@/lib/utils";
import Avatar from "./avatar";

export function FriendCard({ 
  email, 
  firstName, 
  lastName,
  selected,
  children
}: { 
  email: string; 
  firstName?: string; 
  lastName?: string; 
  selected?: boolean;
  children?: React.ReactNode 
}) {
  const displayName = getDisplayName(firstName, lastName) || email;

  return (
    <div className={cn("rounded-3xl bg-secondary p-2 space-y-2", {
      "animate-[wiggle_1s_ease-in-out_infinite]": selected,
    })}>
      <div className="relative flex items-center justify-center aspect-square">
        {children}
      </div>
      <div className="flex items-center flex-wrap gap-2">
        <Avatar size={32} firstName={firstName} lastName={lastName} email={email} style={!displayName ? "shape" : "character"} />
        <p className={cn("font-medium text-sm flex-1", {
          "text-muted-foreground": !displayName,
        })}>
          <span className="line-clamp-1 break-all">{displayName || "--"}</span>
        </p>
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