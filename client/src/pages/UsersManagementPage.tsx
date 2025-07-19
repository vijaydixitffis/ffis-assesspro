
import { useState } from "react";
import { DashboardNav } from "@/components/DashboardNav";
import UsersList from "@/components/users/UsersList";
import UserForm from "@/components/users/UserForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Users } from "lucide-react";
import { useAuth } from "@/contexts/auth";
import { User } from "@/contexts/auth/types";

export default function UsersManagementPage() {
  const { user } = useAuth();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

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
    // Trigger a refresh of the users list
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="flex flex-1">
        <DashboardNav />
        <div className="flex-1">
          <div className="p-6 space-y-6">
            {/* Enhanced Header */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-6 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                    <Users className="h-6 w-6" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold">Manage Users</h1>
                    <p className="text-purple-100 text-sm">Control user access and permissions</p>
                  </div>
                </div>
                <Button 
                  onClick={handleAddUser} 
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm gap-1"
                >
                  <PlusCircle className="h-4 w-4" />
                  Add New User
                </Button>
              </div>
            </div>

            {isFormOpen ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                <div className="mb-4">
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                    {selectedUser ? "Edit User" : "Add New User"}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedUser
                      ? "Update user details or status"
                      : "Create a new user account"}
                  </p>
                </div>
                <UserForm 
                  user={selectedUser} 
                  onCancel={handleCloseForm} 
                  onSuccess={handleCloseForm} 
                />
              </div>
            ) : null}

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Users</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Manage system users and their access</p>
              </div>
              <UsersList onEdit={handleEditUser} key={refreshTrigger} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
