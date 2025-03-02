
import { useState } from "react";
import { DashboardNav } from "@/components/DashboardNav";
import UsersList from "@/components/users/UsersList";
import UserForm from "@/components/users/UserForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useAuth } from "@/contexts/auth";
import { User } from "@/contexts/auth/types";

export default function UsersManagementPage() {
  const { user } = useAuth();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Only admins can manage users
  if (user?.role !== "admin") {
    return (
      <div className="flex min-h-screen flex-col">
        <div className="flex flex-1">
          <DashboardNav />
          <div className="flex-1 p-8">
            <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
            <p>You do not have permission to access this page.</p>
          </div>
        </div>
      </div>
    );
  }

  const handleAddUser = () => {
    setSelectedUser(null);
    setIsFormOpen(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedUser(null);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex flex-1">
        <DashboardNav />
        <div className="flex-1">
          <div className="flex h-16 items-center justify-between border-b px-6">
            <h1 className="text-xl font-semibold">Manage Users</h1>
            <Button 
              onClick={handleAddUser} 
              variant="default" 
              size="sm"
              className="gap-1"
            >
              <PlusCircle className="h-4 w-4" />
              Add New User
            </Button>
          </div>
          <div className="p-6">
            {isFormOpen ? (
              <Card className="mb-6 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle>
                    {selectedUser ? "Edit User" : "Add New User"}
                  </CardTitle>
                  <CardDescription>
                    {selectedUser
                      ? "Update user details or status"
                      : "Create a new user account"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <UserForm 
                    user={selectedUser} 
                    onCancel={handleCloseForm} 
                    onSuccess={handleCloseForm} 
                  />
                </CardContent>
              </Card>
            ) : null}

            <Card className="shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle>Users</CardTitle>
                <CardDescription>Manage system users and their access</CardDescription>
              </CardHeader>
              <Separator />
              <CardContent className="pt-6">
                <UsersList onEdit={handleEditUser} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
