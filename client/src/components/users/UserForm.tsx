import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/contexts/auth/types';

const userSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  role: z.enum(['admin', 'client']),
  is_active: z.boolean().default(true),
});

type UserFormData = z.infer<typeof userSchema>;

interface UserFormProps {
  user?: User | null;
  onCancel: () => void;
  onSuccess: () => void;
}

export default function UserForm({ user, onCancel, onSuccess }: UserFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      first_name: user?.firstName || '',
      last_name: user?.lastName || '',
      role: (user?.role as 'admin' | 'client') || 'client',
      is_active: user?.isActive ?? true,
    },
  });

  const onSubmit = async (data: UserFormData) => {
    setIsLoading(true);
    try {
      if (user) {
        // Update existing user
        const { error } = await supabase
          .from('profiles')
          .update({
            first_name: data.first_name,
            last_name: data.last_name,
            role: data.role.toUpperCase(),
            is_active: data.is_active,
          })
          .eq('id', user.id);

        if (error) throw error;
        toast.success('User updated successfully');
      } else {
        // Create new user - this would typically require auth signup
        toast.error('User creation not implemented yet');
        return;
      }
      
      onSuccess();
    } catch (error) {
      console.error('Error saving user:', error);
      toast.error('Failed to save user');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="first_name">First Name</Label>
          <Input
            id="first_name"
            {...form.register('first_name')}
            placeholder="Enter first name"
          />
          {form.formState.errors.first_name && (
            <p className="text-sm text-red-500">{form.formState.errors.first_name.message}</p>
          )}
        </div>
        
        <div>
          <Label htmlFor="last_name">Last Name</Label>
          <Input
            id="last_name"
            {...form.register('last_name')}
            placeholder="Enter last name"
          />
          {form.formState.errors.last_name && (
            <p className="text-sm text-red-500">{form.formState.errors.last_name.message}</p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="role">Role</Label>
        <Select value={form.watch('role')} onValueChange={(value) => form.setValue('role', value as 'admin' | 'client')}>
          <SelectTrigger>
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="client">Client</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="is_active"
          checked={form.watch('is_active')}
          onCheckedChange={(checked) => form.setValue('is_active', checked)}
        />
        <Label htmlFor="is_active">Active</Label>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : user ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  );
}