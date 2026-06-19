export function humanError(error) {
  const msg = error?.message || 'Something went wrong';
  if (msg.includes('already exists')) return 'This phone number is already registered.';
  if (msg.includes('Invalid phone or password')) return 'Phone or password is wrong.';
  if (msg.includes('verify')) return 'Please verify your account first.';
  return msg;
}
