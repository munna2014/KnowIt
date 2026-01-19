"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../Navbar";
import {
  apiRequest,
  getAuthUser,
  getAuthToken,
  saveAuthUser,
  clearAuthToken,
} from "../../lib/api";

const genderOptions = [
  { value: "", label: "Select Gender" },
  { value: "woman", label: "Woman" },
  { value: "man", label: "Man" },
  { value: "nonbinary", label: "Non-binary" },
  { value: "other", label: "Other" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
];

const resolveAvatarUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http") || url.startsWith("blob:") || url.startsWith("data:")) {
    return url;
  }
  return `http://localhost:8000${url}`;
};

const isLocalStorageAvatarUrl = (url) => {
  if (!url) return false;
  if (url.startsWith("/storage/")) return true;
  if (url.includes("/storage/avatars/")) return true;
  try {
    const parsed = new URL(url);
    return parsed.pathname.startsWith("/storage/");
  } catch {
    return false;
  }
};

export default function ProfilePage() {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    gender: "",
    birthday: "",
    avatarUrl: "",
    bio: "",
  });
  const [avatarPreview, setAvatarPreview] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    
    const initializeProfile = async () => {
      const user = getAuthUser();
      const token = getAuthToken();
      
      // If no user or token, redirect to login
      if (!user || !token) {
        if (mountedRef.current) {
          router.push("/component/login");
        }
        return;
      }
      
      // Fetch fresh user data from API
      try {
        const data = await apiRequest("profile");
        if (data?.user && mountedRef.current) {
          // Update localStorage with fresh data
          saveAuthUser(data.user);
          
          // Load fresh user data into form
          setForm({
            firstName: data.user.first_name || "",
            lastName: data.user.last_name || "",
            email: data.user.email || "",
            phone: data.user.phone || "",
            gender: data.user.gender || "",
            birthday: data.user.birthday || "",
            avatarUrl: data.user.avatar_url || "",
            bio: data.user.bio || "",
          });
          
          // Set avatar preview if available
          if (data.user.avatar_url) {
            console.log("Setting avatar preview from API:", data.user.avatar_url);
            setAvatarPreview(data.user.avatar_url);
          }
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        // Fall back to localStorage data if API fails
        if (mountedRef.current) {
          setForm({
            firstName: user.first_name || "",
            lastName: user.last_name || "",
            email: user.email || "",
            phone: user.phone || "",
            gender: user.gender || "",
            birthday: user.birthday || "",
            avatarUrl: user.avatar_url || "",
            bio: user.bio || "",
          });
          
          // Set avatar preview if available
          if (user.avatar_url) {
            console.log("Setting avatar preview from localStorage:", user.avatar_url);
            setAvatarPreview(user.avatar_url);
          }
        }
      } finally {
        if (mountedRef.current) {
          setIsLoading(false);
        }
      }
    };

    initializeProfile();
    
    return () => {
      mountedRef.current = false;
    };
  }, [router]);

  const handleChange = useCallback((event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }, []);

  const handleAvatarFile = useCallback((file) => {
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file.');
      return;
    }
    
    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB.');
      return;
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setError("");
  }, []);

  const handleFileInput = useCallback((event) => {
    const file = event.target.files?.[0];
    if (file) {
      handleAvatarFile(file);
    }
  }, [handleAvatarFile]);

  const handleDrop = useCallback((event) => {
    event.preventDefault();
    setIsDragOver(false);
    
    const file = event.dataTransfer.files?.[0];
    if (file) {
      handleAvatarFile(file);
    }
  }, [handleAvatarFile]);

  const handleDragOver = useCallback((event) => {
    event.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((event) => {
    event.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleUploadAvatar = useCallback(async () => {
    if (!avatarFile || isUploading) return;
    setIsUploading(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();
      formData.append("avatar", avatarFile);
      const data = await apiRequest("profile/avatar", {
        method: "POST",
        data: formData,
      });

      if (data?.user) {
        saveAuthUser(data.user);
        setForm((current) => ({
          ...current,
          avatarUrl: data.user.avatar_url || "",
        }));
        setAvatarPreview(data.user.avatar_url || "");
        setAvatarFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        
        // Trigger navbar update
        window.dispatchEvent(new Event('userUpdated'));
      }
      setSuccess("Profile photo updated successfully!");
    } catch (err) {
      console.error("Avatar upload error:", err);
      
      // Only handle actual authentication errors
      if (err.status === 401) {
        setError("Your session has expired. Please log in again.");
        // Give user time to read the message before redirecting
        setTimeout(() => {
          clearAuthToken();
          router.push("/component/login");
        }, 3000);
      } else {
        // For other errors, show the error but don't log out the user
        setError(err?.message || "Could not upload photo. Please try again.");
      }
    } finally {
      setIsUploading(false);
    }
  }, [avatarFile, isUploading, router]);

  const handleRemoveAvatar = useCallback(async () => {
    if (isUploading) return;
    setIsUploading(true);
    setError("");
    setSuccess("");

    try {
      const data = await apiRequest("profile/avatar", { method: "DELETE" });
      if (data?.user) {
        saveAuthUser(data.user);
      }
      setAvatarPreview("");
      setAvatarFile(null);
      setForm((current) => ({ ...current, avatarUrl: "" }));
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      
      // Trigger navbar update
      window.dispatchEvent(new Event('userUpdated'));
      
      setSuccess("Profile photo removed successfully!");
    } catch (err) {
      console.error("Avatar removal error:", err);
      
      // Only handle actual authentication errors
      if (err.status === 401) {
        setError("Your session has expired. Please log in again.");
        // Give user time to read the message before redirecting
        setTimeout(() => {
          clearAuthToken();
          router.push("/component/login");
        }, 3000);
      } else {
        // For other errors, show the error but don't log out the user
        setError(err?.message || "Could not remove photo. Please try again.");
      }
    } finally {
      setIsUploading(false);
    }
  }, [isUploading, router]);

  const handleSave = useCallback(async (event) => {
    event.preventDefault();
    setIsSaving(true);
    setError("");
    setSuccess("");

    // Check if user is still authenticated before making the request
    const token = getAuthToken();
    if (!token) {
      setError("Please log in to save your profile.");
      router.push("/component/login");
      return;
    }

    try {
      const payload = {
        first_name: form.firstName?.trim() || undefined,
        last_name: form.lastName?.trim() || undefined,
        name: `${form.firstName} ${form.lastName}`.trim() || undefined,
        email: form.email?.trim() || undefined,
        phone: form.phone?.trim() || undefined,
        gender: form.gender || undefined,
        birthday: form.birthday || undefined,
        bio: form.bio?.trim() || undefined,
      };

      // Only send avatar_url when the user provides an external URL.
      const trimmedAvatarUrl = form.avatarUrl?.trim();
      if (trimmedAvatarUrl && !isLocalStorageAvatarUrl(trimmedAvatarUrl)) {
        payload.avatar_url = trimmedAvatarUrl;
      }

      console.log("Sending profile update payload:", payload);

      const data = await apiRequest("profile", {
        method: "PUT",
        data: payload,
      });

      console.log("Profile update response:", data);

      if (data?.user) {
        const currentUser = getAuthUser();
        const nextAvatarUrl =
          data.user.avatar_url || form.avatarUrl || avatarPreview || currentUser?.avatar_url || "";
        const mergedUser = {
          ...currentUser,
          ...data.user,
          avatar_url: nextAvatarUrl,
        };
        console.log("Saving updated user data:", mergedUser);
        saveAuthUser(mergedUser);
        
        // Update form with fresh data from server
        setForm({
          firstName: data.user.first_name || "",
          lastName: data.user.last_name || "",
          email: data.user.email || "",
          phone: data.user.phone || "",
          gender: data.user.gender || "",
          birthday: data.user.birthday || "",
          avatarUrl: nextAvatarUrl,
          bio: data.user.bio || "",
        });
        setAvatarPreview(nextAvatarUrl);
        
        // Trigger navbar update
        window.dispatchEvent(new Event('userUpdated'));
      }

      setSuccess("Profile updated successfully!");
    } catch (err) {
      console.error("Profile update error:", err);
      
      // Handle different types of errors
      if (err.status === 401) {
        setError("Your session has expired. Please log in again.");
        setTimeout(() => {
          clearAuthToken();
          router.push("/component/login");
        }, 3000);
      } else if (err.status === 422) {
        // Validation errors
        setError(err?.message || "Please check your input and try again.");
      } else if (err.status >= 500) {
        // Server errors
        setError("Server error. Please try again later.");
      } else {
        // Other errors
        setError(err?.message || "Could not update profile. Please try again.");
      }
    } finally {
      setIsSaving(false);
    }
  }, [form, avatarPreview, router]);

  const getUserInitials = useCallback(() => {
    const firstName = form.firstName?.trim();
    const lastName = form.lastName?.trim();
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    if (firstName) {
      return firstName.substring(0, 2).toUpperCase();
    }
    if (form.email) {
      return form.email.substring(0, 2).toUpperCase();
    }
    return "U";
  }, [form.firstName, form.lastName, form.email]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-black">
        <Navbar />
        <div className="pt-16">
          <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-emerald-500 border-r-transparent"></div>
                <p className="mt-4 text-slate-300">Loading profile...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-black">
      <Navbar />
      
      <div className="pt-16">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">Profile Settings</h1>
            <p className="mt-2 text-slate-300">
              Manage your account information and preferences
            </p>
          </div>

          {/* Alert Messages */}
          {error && (
            <div className="mb-6 rounded-lg border border-red-400/30 bg-red-500/10 p-4">
              <div className="flex">
                <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="ml-3 text-sm text-red-200">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-6 rounded-lg border border-emerald-400/30 bg-emerald-500/10 p-4">
              <div className="flex">
                <svg className="h-5 w-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="ml-3 text-sm text-emerald-200">{success}</p>
              </div>
            </div>
          )}

          <div className="space-y-8">
            {/* Profile Photo Section */}
            <div className="rounded-xl border border-slate-700/60 bg-slate-900/70 p-10 shadow-xl">
              <div className="mb-10">
                <h2 className="text-2xl font-semibold text-white">Profile Photo</h2>
                <p className="mt-2 text-slate-300">
                  Upload a professional photo to help others recognize you
                </p>
              </div>

              <div className="flex flex-col items-center gap-12 xl:flex-row xl:items-start">
                {/* Much Larger Profile Picture Section */}
                <div className="flex flex-col items-center xl:w-2/5">
                  <div className="relative">
                    <div className="h-64 w-64 overflow-hidden rounded-3xl bg-slate-800 ring-4 ring-slate-600/50 shadow-2xl">
                      {avatarPreview ? (
                        <img
                          src={resolveAvatarUrl(avatarPreview)}
                          alt="Profile preview"
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            setAvatarPreview("");
                          }}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-600 to-blue-700 text-5xl font-bold text-white">
                          {getUserInitials()}
                        </div>
                      )}
                    </div>
                    {avatarPreview && (
                      <div className="absolute -bottom-3 -right-3 rounded-full bg-emerald-500 p-3 ring-4 ring-slate-900">
                        <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                  
                  {/* Profile Info Below Picture */}
                  <div className="mt-8 text-center">
                    <h3 className="text-2xl font-bold text-white">
                      {form.firstName || form.lastName ? `${form.firstName} ${form.lastName}`.trim() : "Your Name"}
                    </h3>
                    <p className="mt-2 text-base text-slate-400">{form.email || "your@email.com"}</p>
                  </div>
                </div>

                <div className="flex-1 xl:w-3/5 space-y-6">
                  {/* Smaller Drag & Drop Zone */}
                  <div
                    ref={dropZoneRef}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => fileInputRef.current?.click()}
                    className={`cursor-pointer rounded-lg border-2 border-dashed p-4 text-center transition-colors ${
                      isDragOver
                        ? "border-blue-400 bg-blue-500/10"
                        : "border-slate-600 hover:border-slate-500 hover:bg-slate-800/50"
                    }`}
                  >
                    <svg className="mx-auto h-6 w-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="mt-2 text-sm font-medium text-slate-200">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-slate-400">
                      PNG, JPG, GIF up to 5MB
                    </p>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileInput}
                    className="hidden"
                  />

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3">
                    {avatarFile && (
                      <button
                        type="button"
                        onClick={handleUploadAvatar}
                        disabled={isUploading}
                        className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-emerald-600/30 transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isUploading ? (
                          <>
                            <svg className="h-4 w-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Uploading...
                          </>
                        ) : (
                          <>
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            Upload Photo
                          </>
                        )}
                      </button>
                    )}
                    
                    {avatarPreview && (
                      <button
                        type="button"
                        onClick={handleRemoveAvatar}
                        disabled={isUploading}
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-600 bg-slate-800/50 px-4 py-2 text-sm font-medium text-slate-200 shadow-sm transition-colors hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Remove Photo
                      </button>
                    )}
                  </div>

                  {/* Smaller URL Input */}
                  <div className="max-w-md">
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Or paste image URL
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        name="avatarUrl"
                        placeholder="https://example.com/photo.jpg"
                        value={form.avatarUrl}
                        onChange={handleChange}
                        className="flex-1 rounded-lg border border-slate-600 bg-slate-800/50 px-3 py-2 text-sm text-slate-200 placeholder-slate-500 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      />
                      <button
                        type="button"
                        onClick={() => setAvatarPreview(form.avatarUrl)}
                        disabled={!form.avatarUrl}
                        className="rounded-lg bg-slate-700 px-3 py-2 text-xs font-medium text-slate-200 transition-colors hover:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Preview
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <form onSubmit={handleSave} className="rounded-xl border border-slate-700/60 bg-slate-900/70 p-10 shadow-xl">
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-white">Personal Information</h2>
                <p className="mt-2 text-slate-300">
                  Update your personal details and contact information
                </p>
              </div>

              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={form.firstName}
                    onChange={handleChange}
                    className="block w-full rounded-lg border border-slate-600 bg-slate-800/50 px-4 py-3 text-slate-200 placeholder-slate-500 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    placeholder="Enter your first name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={form.lastName}
                    onChange={handleChange}
                    className="block w-full rounded-lg border border-slate-600 bg-slate-800/50 px-4 py-3 text-slate-200 placeholder-slate-500 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    placeholder="Enter your last name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={form.gender}
                    onChange={handleChange}
                    className="block w-full rounded-lg border border-slate-600 bg-slate-800/50 px-4 py-3 text-slate-200 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  >
                    {genderOptions.map((option) => (
                      <option key={option.value} value={option.value} className="bg-slate-800 text-slate-200">
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className="block w-full rounded-lg border border-slate-600 bg-slate-800/50 px-4 py-3 text-slate-200 placeholder-slate-500 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    placeholder="Enter your email"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    className="block w-full rounded-lg border border-slate-600 bg-slate-800/50 px-4 py-3 text-slate-200 placeholder-slate-500 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    placeholder="Enter your phone number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Birthday
                  </label>
                  <input
                    type="date"
                    name="birthday"
                    value={form.birthday}
                    onChange={handleChange}
                    className="block w-full rounded-lg border border-slate-600 bg-slate-800/50 px-4 py-3 text-slate-200 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              {/* Bio Section - Full Width */}
              <div className="mt-8">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Bio
                </label>
                <textarea
                  name="bio"
                  value={form.bio}
                  onChange={handleChange}
                  rows={4}
                  className="block w-full rounded-lg border border-slate-600 bg-slate-800/50 px-4 py-3 text-slate-200 placeholder-slate-500 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  placeholder="Tell us about yourself... (optional)"
                />
                <p className="mt-2 text-xs text-slate-400">
                  This will be displayed on your blog posts. Maximum 1000 characters.
                </p>
              </div>

              <div className="mt-10 flex justify-between items-center gap-4">
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-600 bg-slate-800/50 px-4 py-3 text-sm font-medium text-slate-200 shadow-sm transition-colors hover:bg-slate-700"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh Page
                </button>
                
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        // Fetch fresh data from API
                        const data = await apiRequest("profile");
                        if (data?.user) {
                          saveAuthUser(data.user);
                          setForm({
                            firstName: data.user.first_name || "",
                            lastName: data.user.last_name || "",
                            email: data.user.email || "",
                            phone: data.user.phone || "",
                            gender: data.user.gender || "",
                            birthday: data.user.birthday || "",
                            avatarUrl: data.user.avatar_url || "",
                            bio: data.user.bio || "",
                          });
                          setAvatarPreview(data.user.avatar_url || "");
                          setSuccess("Form reset with latest data!");
                        }
                      } catch (err) {
                        console.error("Error fetching fresh data:", err);
                        // Fall back to localStorage
                        const user = getAuthUser();
                        if (user) {
                          setForm({
                            firstName: user.first_name || "",
                            lastName: user.last_name || "",
                            email: user.email || "",
                            phone: user.phone || "",
                            gender: user.gender || "",
                            birthday: user.birthday || "",
                            avatarUrl: user.avatar_url || "",
                            bio: user.bio || "",
                          });
                          setAvatarPreview(user.avatar_url || "");
                          setSuccess("Form reset to saved values!");
                        }
                      }
                    }}
                    className="rounded-lg border border-slate-600 bg-slate-800/50 px-6 py-3 text-sm font-medium text-slate-200 shadow-sm transition-colors hover:bg-slate-700"
                  >
                    Reset
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-emerald-600/30 transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isSaving ? (
                      <>
                        <svg className="h-4 w-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Saving...
                      </>
                    ) : (
                      <>
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
