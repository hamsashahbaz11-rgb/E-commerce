import jwt from 'jsonwebtoken';

// Verify JWT token
export function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
  } catch (error) {
    console.error('Error verifying token:', error);
    return null;
  }
}

// Generate JWT token
export function generateToken(payload) {
  return jwt.sign(
    payload,
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '7d' }
  );
}

// Middleware to check if user is authenticated
export async function isAuthenticated(request) {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  const token = authHeader.split(' ')[1];
  return verifyToken(token);
}

// Middleware to check if user is admin
export async function isAdmin(request) {
  const user = await isAuthenticated(request);
  
  if (!user) {
    return false;
  }
  
  return user.role === 'admin';
}

// Middleware to check if user is seller
export async function isSeller(request) {
  const user = await isAuthenticated(request);
  
  if (!user) {
    return false;
  }
  
  return user.role === 'seller' || user.role === 'admin';
}