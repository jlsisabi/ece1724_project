import { supabase } from './supabase';
import sha256 from 'js-sha256';

// Hash password using SHA-256
const hashPassword = (password: string): string => {
  return sha256(password);
};

// Generate a deterministic email for Supabase auth
const generateAuthEmail = (username: string): string => {
  // Create a consistent email based on username
  const sanitizedUsername = username.toLowerCase().replace(/[^a-z0-9]/g, '.');
  return `${sanitizedUsername}@noteflow.app`;
};

export async function signUp(username: string, password: string) {
  try {
    // Check if username already exists
    const { data: existingUsers, error: queryError } = await supabase
      .from('auth_users')
      .select('username')
      .eq('username', username);

    if (queryError) throw queryError;
    if (existingUsers && existingUsers.length > 0) {
      throw new Error('Username already taken');
    }

    // Generate deterministic email for Supabase auth
    const authEmail = generateAuthEmail(username);

    // Create Supabase auth user first
    const { error: authError } = await supabase.auth.signUp({
      email: authEmail,
      password: password
    });

    if (authError) throw authError;

    // Create new user in auth_users table
    const { data, error } = await supabase
      .from('auth_users')
      .insert([
        {
          username,
          password_hash: hashPassword(password)
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function signIn(username: string, password: string) {
  try {
    // Get user from auth_users table
    const { data: users, error: queryError } = await supabase
      .from('auth_users')
      .select('*')
      .eq('username', username)
      .eq('password_hash', hashPassword(password));

    if (queryError) throw queryError;
    if (!users || users.length === 0) {
      throw new Error('Invalid username or password');
    }

    const user = users[0];

    // Sign in with Supabase auth using deterministic email
    const authEmail = generateAuthEmail(username);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: authEmail,
      password
    });

    if (signInError) throw signInError;

    // Update last login timestamp
    await supabase
      .from('auth_users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', user.id);

    return { data: user, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function signOut() {
  await supabase.auth.signOut();
  return { error: null };
}

export async function getCurrentUser() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;

  const { data: users } = await supabase
    .from('auth_users')
    .select('*');

  return users?.[0] || null;
}