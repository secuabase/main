import { Button } from "@/components/ui/button";

export function LogoutButton({ className, variant = "secondary" }: { className?: string; variant?: "secondary" | "default" | "ghost" }) {
  return (
    <form action="/auth/logout" method="post" className={className}>
      <Button type="submit" variant={variant} className="h-12 w-full text-[15px] font-normal">
        Log out
      </Button>
    </form>
  );
}
