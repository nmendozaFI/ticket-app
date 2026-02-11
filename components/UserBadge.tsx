"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut, UserCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useUserContext } from "@/context/userContext";
import { signOut } from "@/actions/auth-actions";

export function UserBadge() {
  const { user } = useUserContext();
  const router = useRouter();

  if (!user) {
    return null;
  }

  const roleColors = {
    USER: "bg-blue-600",
    ADMIN: "bg-purple-600",
  };

  const handleLogout = async () => {
    await signOut();
    router.push("/auth");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="hidden text-sm font-medium md:inline">
            {user.name}
          </span>
          <Badge
            className={`hidden ${
              roleColors[user.role]
            } text-white md:inline-flex`}
          >
            {user.role}
          </Badge>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col gap-1">
            <span className="font-medium">{user.name}</span>
            <Badge
              className={`w-fit ${roleColors[user.role]} text-white text-xs`}
            >
              {user.role}
            </Badge>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile" className="flex items-center cursor-pointer">
            <UserCircle className="mr-2 h-4 w-4" />
            Ver Perfil
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogout}
          className="text-destructive focus:text-destructive cursor-pointer"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Cerrar Sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
