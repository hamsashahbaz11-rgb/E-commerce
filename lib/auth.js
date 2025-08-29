import jwt from 'jsonwebtoken';

// Verify JWT token
export function verifyToken(token) {
  if (!token) {
    console.error('No token provided');
    throw new Error('Token is required');
  }

  if (!process.env.JWT_SECRET) {
    console.warn('JWT_SECRET not found in environment variables, using default secret');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret-key');
    
    if (!decoded || !decoded.id) {
      throw new Error('Invalid token structure');
    }

    return decoded;
  } catch (error) {
    console.error('Token verification failed:', {
      error: error.message,
      name: error.name,
      expiredAt: error.expiredAt,
      token: token.substring(0, 10) + '...' // Log only first 10 chars for security
    });

    if (error.name === 'TokenExpiredError') {
      throw new Error('Token has expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token format');
    } else {
      throw new Error('Token verification failed');
    }
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
  
  if (!user || !user.role === 'admin') {
    return false;
  }
  
  return user.role === 'admin';
}

// Middleware to check if user is seller
export async function isSeller(request) {
  const user = await isAuthenticated(request);
  
  if (!user || !user.role === "seller") {
    return false;
  }
  
  return user.role === 'seller' || user.role === 'admin';
}

export async function  isDileveryMan(request) {
   const user = await isAuthenticated(request);

    if (!user || !user.role === "deliveryman") {
    return false;
  }

  return user.role === 'deliveryman'
}