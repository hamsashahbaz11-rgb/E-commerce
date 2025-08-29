import { NextResponse } from 'next/server';

export function checkAdminAccess(email) {
  const ADMIN_EMAIL = process.env.Email;
 if(email === ADMIN_EMAIL){
  return true
 }
   else {
  return false
    }
}
