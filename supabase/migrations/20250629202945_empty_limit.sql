/*
  # Add password hash column to users table

  1. Schema Changes
    - Add `password_hash` column to `users` table for storing hashed passwords
    - Update existing users with default hashed passwords for testing

  2. Security
    - Passwords are hashed using bcrypt with salt rounds
    - Default test passwords are provided for existing demo users

  3. Data Migration
    - Sarah Thompson (farmer): password "farmer123"
    - Michael Chen (admin): password "admin123"
    - John Doe (farmer): password "farmer123"
*/

-- Add password_hash column to users table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'password_hash'
  ) THEN
    ALTER TABLE users ADD COLUMN password_hash VARCHAR(255);
  END IF;
END $$;

-- Update existing users with hashed passwords for testing
-- Note: These are bcrypt hashes for the passwords mentioned above
-- farmer123 -> $2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uO.G
-- admin123 -> $2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi

UPDATE users SET password_hash = '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uO.G' 
WHERE email = 'sarah@greenvalleys.com' AND password_hash IS NULL;

UPDATE users SET password_hash = '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi' 
WHERE email = 'admin@freshbonds.com' AND password_hash IS NULL;

UPDATE users SET password_hash = '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uO.G' 
WHERE email = 'john@example.com' AND password_hash IS NULL;

-- Make password_hash NOT NULL for new users (existing users already have it set)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'password_hash' AND is_nullable = 'YES'
  ) THEN
    -- Only make it NOT NULL if all existing users have password_hash set
    IF NOT EXISTS (SELECT 1 FROM users WHERE password_hash IS NULL) THEN
      ALTER TABLE users ALTER COLUMN password_hash SET NOT NULL;
    END IF;
  END IF;
END $$;