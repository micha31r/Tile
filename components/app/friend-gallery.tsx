import Avatar from "./avatar";

export function FriendCard({ email, name, children }: { email: string; name: string; children?: React.ReactNode }) {
  return (
    <div className="rounded-3xl bg-secondary p-2 space-y-2">
      <div className="flex items-center justify-center aspect-square">
        {children}
      </div>
      <div className="flex items-center flex-wrap gap-2">
        <Avatar value={email} />
        <p className="font-medium text-sm">{name}</p>
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