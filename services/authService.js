const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { sendOtp } = require('../utils/otpGenerator');

const supabaseUrl = 'https://bgtclsztsuodczvwpbyw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJndGNsc3p0c3VvZGN6dndwYnl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI3MzAyODgsImV4cCI6MjA1ODMwNjI4OH0.ZVk4wtFMAmHRFN0g6RIdzbCm48myqDvS8uFvWSFrb74';
const supabase = createClient(supabaseUrl, supabaseKey);

const JWT_SECRET = 'Mz/kaTPVSeIBcO8xSa31o7dUBtOeOx85bUNZIe/faEDBwHhU6scgW331h7DnUqUrYNOiyPFpzq6bPGslppw1UQ==';

async function signupUser({ firstName, lastName, username, email, phone, dob, gender, bloodGroup }) {
  const { data: existingUser, error: findError } = await supabase
    .from('users')
    .select('*')
    .or(`email.eq.${email},username.eq.${username}`)
    .single();

  if (existingUser) {
    if (existingUser.verified) {
      throw new Error('User with this email or username already exists and is verified.');
    } else {
      const { error: updateError } = await supabase
        .from('users')
        .update({
          first_name: firstName,
          last_name: lastName,
          username,
          email,
          phone,
          dob,
          gender,
          blood_group: bloodGroup
        })
        .eq('id', existingUser.id);

      if (updateError) throw new Error(updateError.message);
    }
  } else {
    const { error } = await supabase
      .from('users')
      .insert([
        { first_name: firstName, last_name: lastName, username, email, phone, dob, gender, blood_group: bloodGroup, verified: false },
      ]);
    if (error) throw new Error(error.message);
  }

  const otp = Math.floor(100000 + Math.random() * 900000);
  await sendOtp(email, phone, otp);

  await supabase
    .from('otps')
    .upsert([{ email, phone, otp }], { onConflict: ['email', 'phone'] });

  return { message: 'Signup successful. OTP sent to email/phone.' };
}

async function verifyOtp({ email, phone, otp }) {
  const { data, error } = await supabase
    .from('otps')
    .select('*')
    .eq(email ? 'email' : 'phone', email || phone)
    .eq('otp', otp)
    .single();

  if (error || !data) throw new Error('Invalid OTP.');

  await supabase.from('otps').delete().eq('id', data.id);

  return { message: 'OTP verified successfully.' };
}

async function setPassword({ username, password }) {
  const hashedPassword = await bcrypt.hash(password, 10);

  const { error } = await supabase
    .from('users')
    .update({ password: hashedPassword })
    .eq('username', username);

  if (error) throw new Error(error.message);

  return { message: 'Password set successfully.' };
}

async function loginUser({ username, password }) {
  const { data, error } = await supabase.from('users').select('*').eq('username', username).single();

  if (error || !data) throw new Error('Invalid username or password.');

  const isPasswordValid = await bcrypt.compare(password, data.password);
  if (!isPasswordValid) throw new Error('Invalid username or password.');

  const token = jwt.sign({ id: data.id, username: data.username }, JWT_SECRET, { expiresIn: '1h' });

  return { message: 'Login successful.', token, user: { id: data.id, username: data.username } };
}

function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    throw new Error('Invalid or expired token.');
  }
}

async function updateUserDetails(userId, updates) {
  const { error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId);

  if (error) throw new Error(error.message);

  return { message: 'User details updated successfully.' };
}

module.exports = {
  signupUser,
  verifyOtp,
  setPassword,
  loginUser,
  verifyToken,
  updateUserDetails,
};