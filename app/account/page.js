'use client'
import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';

const Account = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const res = await fetch('/api/user'); // Assuming an endpoint to get user data
      const data = await res.json();
      setUser(data.user);
    };
    fetchUser();
  }, []);

  const handleUpdateProfile = async () => {
    // Logic to update user profile
  };

  const handleChangePassword = async () => {
    // Logic to change user password
  };

  if (!user) return <p>Loading...</p>;

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-4">Account</h1>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-2">Profile Information</h2>
          <p className="text-gray-700 mb-2">Name: {user.name}</p>
          <p className="text-gray-700 mb-2">Email: {user.email}</p>
          <button
            onClick={handleUpdateProfile}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition duration-300 mt-4"
          >
            Edit Profile
          </button>
          <button
            onClick={handleChangePassword}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition duration-300 mt-4 ml-4"
          >
            Change Password
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default Account; 