"use client";

import { useState, useEffect } from "react";
import { apiRequest, getAuthToken, saveAuthToken } from "../lib/api";

export default function TestAuthPage() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState("");
  const [testResult, setTestResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Test registration
  const testRegister = async () => {
    setLoading(true);
    setError("");
    try {
      const testEmail = `test${Date.now()}@example.com`;
      const data = await apiRequest("register", {
        method: "POST",
        data: {
          name: "Test User",
          first_name: "Test",
          last_name: "User",
          email: testEmail,
          password: "password123",
          password_confirmation: "password123",
          birthday: "1990-01-01",
          gender: "other"
        }
      });
      
      if (data.token) {
        saveAuthToken(data.token);
        setToken(data.token);
        setUser(data.user);
        setTestResult(`✅ Registration successful! User: ${data.user.email}`);
      }
    } catch (err) {
      setError(`❌ Registration failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Test login
  const testLogin = async () => {
    setLoading(true);
    setError("");
    try {
      // First register a user to login with
      const testEmail = `login${Date.now()}@example.com`;
      await apiRequest("register", {
        method: "POST",
        data: {
          name: "Login Test",
          email: testEmail,
          password: "password123",
          password_confirmation: "password123"
        }
      });

      // Now login with that user
      const loginData = await apiRequest("login", {
        method: "POST",
        data: {
          identifier: testEmail,
          password: "password123"
        }
      });
      
      if (loginData.token) {
        saveAuthToken(loginData.token);
        setToken(loginData.token);
        setUser(loginData.user);
        setTestResult(`✅ Login successful! User: ${loginData.user.email}`);
      }
    } catch (err) {
      setError(`❌ Login failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Test authenticated endpoint
  const testAuthEndpoint = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiRequest("test");
      setTestResult(`✅ Auth endpoint test successful! Message: ${data.message}`);
    } catch (err) {
      setError(`❌ Auth endpoint failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Test logout
  const testLogout = async () => {
    setLoading(true);
    setError("");
    try {
      await apiRequest("logout", { method: "POST" });
      localStorage.removeItem("auth_token");
      setToken("");
      setUser(null);
      setTestResult("✅ Logout successful!");
    } catch (err) {
      setError(`❌ Logout failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Check current auth status
  useEffect(() => {
    const currentToken = getAuthToken();
    if (currentToken) {
      setToken(currentToken);
      // Try to get current user
      apiRequest("me")
        .then(data => setUser(data.user))
        .catch(() => {
          // Token might be invalid, clear it
          localStorage.removeItem("auth_token");
          setToken("");
        });
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Authentication System Test</h1>
        
        {/* Current Status */}
        <div className="bg-slate-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Current Status</h2>
          <div className="space-y-2 text-sm">
            <p className="text-slate-300">
              <span className="font-medium">Token:</span> {token ? "✅ Present" : "❌ None"}
            </p>
            <p className="text-slate-300">
              <span className="font-medium">User:</span> {user ? `✅ ${user.email}` : "❌ Not logged in"}
            </p>
          </div>
        </div>

        {/* Test Results */}
        {(testResult || error) && (
          <div className="bg-slate-800 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">Test Results</h2>
            {testResult && <p className="text-green-400 mb-2">{testResult}</p>}
            {error && <p className="text-red-400">{error}</p>}
          </div>
        )}

        {/* Test Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={testRegister}
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-600 text-white font-semibold py-3 px-6 rounded-lg transition"
          >
            {loading ? "Testing..." : "Test Registration"}
          </button>
          
          <button
            onClick={testLogin}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white font-semibold py-3 px-6 rounded-lg transition"
          >
            {loading ? "Testing..." : "Test Login"}
          </button>
          
          <button
            onClick={testAuthEndpoint}
            disabled={loading || !token}
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 text-white font-semibold py-3 px-6 rounded-lg transition"
          >
            {loading ? "Testing..." : "Test Auth Endpoint"}
          </button>
          
          <button
            onClick={testLogout}
            disabled={loading || !token}
            className="bg-red-600 hover:bg-red-700 disabled:bg-slate-600 text-white font-semibold py-3 px-6 rounded-lg transition"
          >
            {loading ? "Testing..." : "Test Logout"}
          </button>
        </div>

        {/* User Details */}
        {user && (
          <div className="bg-slate-800 rounded-lg p-6 mt-6">
            <h2 className="text-xl font-semibold text-white mb-4">User Details</h2>
            <pre className="text-slate-300 text-sm overflow-auto">
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}