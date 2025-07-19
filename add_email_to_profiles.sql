-- Migration: Add email field to profiles table
-- This script adds an email field to the profiles table and populates it with existing user emails

-- Step 1: Add email column to profiles table
ALTER TABLE profiles ADD COLUMN email TEXT;

-- Step 2: Create a function to update emails from auth.users
-- Note: This requires admin privileges to run
CREATE OR REPLACE FUNCTION update_profile_emails()
RETURNS void AS $$
DECLARE
    auth_user RECORD;
BEGIN
    -- Loop through auth.users and update profiles
    FOR auth_user IN 
        SELECT id, email 
        FROM auth.users 
        WHERE email IS NOT NULL
    LOOP
        UPDATE profiles 
        SET email = auth_user.email 
        WHERE id = auth_user.id;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 3: Execute the function to populate emails
-- Note: This requires admin privileges
SELECT update_profile_emails();

-- Step 4: Make email field NOT NULL after populating
ALTER TABLE profiles ALTER COLUMN email SET NOT NULL;

-- Step 5: Add unique constraint on email
ALTER TABLE profiles ADD CONSTRAINT profiles_email_unique UNIQUE (email);

-- Step 6: Clean up the function
DROP FUNCTION update_profile_emails();

-- Step 7: Update the trigger to handle email updates
-- The existing update_updated_at_column() function will handle this automatically 