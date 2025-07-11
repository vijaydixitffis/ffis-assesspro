
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, UserRole } from "@/contexts/auth/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, UserCheck, UserX } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth";

interface UsersListProps {
  onEdit: (user: User) => void;
}

export default function UsersList({ onEdit }: UsersListProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { user: currentUser } = useAuth();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, role, is_active")
        .order("last_name", { ascending: true });

      if (error) {
        throw error;
      }

      if (data) {
        // Map the Supabase data to our User interface
        const formattedUsers = data.map((user) => ({
          id: user.id,
          firstName: user.first_name || "",
          lastName: user.last_name || "",
          name: `${user.first_name || ""} ${user.last_name || ""}`.trim(),
          role: (user.role?.toLowerCase() === "admin" ? "admin" : "client") as UserRole,
          email: "", // Email is not stored in the profiles table
          isActive: user.is_active
        }));

        // Fetch emails from auth.users
        const emailPromises = formattedUsers.map(async (user) => {
          // We can't directly query auth.users with the JavaScript client,
          // so we would typically use a serverless function for this
          // For now, we'll leave the email empty
          return user;
        });

        const usersWithEmails = await Promise.all(emailPromises);
        setUsers(usersWithEmails);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleUserStatus = async (user: User) => {
    try {
      const newStatus = !user.isActive;
      
      const { error } = await supabase
        .from("profiles")
        .update({ is_active: newStatus })
        .eq("id", user.id);

      if (error) throw error;

      setUsers(
        users.map((u) =>
          u.id === user.id ? { ...u, isActive: newStatus } : u
        )
      );

      toast.success(
        `User ${newStatus ? "activated" : "deactivated"} successfully`
      );
    } catch (error) {
      console.error("Error toggling user status:", error);
      toast.error("Failed to update user status");
    }
  };

  if (loading) {
    return <div className="flex justify-center p-4">Loading users...</div>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[200px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                No users found
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="font-medium">{user.firstName} {user.lastName}</div>
                </TableCell>
                <TableCell>
                  <Badge variant={user.role === "admin" ? "default" : "outline"}>
                    {user.role === "admin" ? "Admin" : "Client"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {user.isActive ? (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-gray-100 text-gray-800">
                      Inactive
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => onEdit(user)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    
                    {/* Don't allow current user to deactivate themselves */}
                    {currentUser?.id !== user.id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleUserStatus(user)}
                      >
                        {user.isActive ? (
                          <UserX className="h-4 w-4 text-red-500" />
                        ) : (
                          <UserCheck className="h-4 w-4 text-green-500" />
                        )}
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
