"use client";

import { useState } from "react";
import { apiRequest } from "../../lib/api";

const ReportModal = ({ isOpen, onClose, post, onReportSubmitted }) => {
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const reasons = [
    { value: "spam", label: "Spam" },
    { value: "harassment", label: "Harassment" },
    { value: "hate_speech", label: "Hate Speech" },
    { value: "inappropriate_content", label: "Inappropriate Content" },
    { value: "copyright_violation", label: "Copyright Violation" },
    { value: "misinformation", label: "Misinformation" },
    { value: "violence", label: "Violence" },
    { value: "other", label: "Other" },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      setError("");

      await apiRequest(`blog-posts/${post.slug}/report`, {
        method: "POST",
        data: {
          reason: reason,
          description: description.trim() || null,
        },
      });

      setSuccess(true);
      setSuccessMessage("Thank you for reporting this post. Our team will review it shortly.");
      setTimeout(() => {
        onReportSubmitted?.();
        onClose();
        setReason("");
        setDescription("");
        setSuccess(false);
        setSuccessMessage("");
      }, 2000); // Show success message for 2 seconds
    } catch (err) {
      console.error("Error submitting report:", err);
      if (err?.status === 409) {
        // User already reported - treat as success but with different message
        setSuccess(true);
        setSuccessMessage("You have already reported this post. Thank you for helping keep our community safe.");
        setTimeout(() => {
          onReportSubmitted?.();
          onClose();
          setReason("");
          setDescription("");
          setSuccess(false);
          setSuccessMessage("");
        }, 2000);
      } else if (err?.status === 403) {
        setError("You cannot report your own post.");
      } else if (err?.status === 422) {
        setError("Please select a valid reason for reporting.");
      } else {
        setError("Could not submit report. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting && !success) {
      onClose();
      setReason("");
      setDescription("");
      setError("");
      setSuccess(false);
      setSuccessMessage("");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900">Report Post</h3>
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting || success}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        {success ? (
          <div className="p-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 mb-4">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Report Submitted</h3>
            <p className="text-sm text-gray-600">
              {successMessage}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-4">
              Why are you reporting "{post?.title}"?
            </p>

            <div className="space-y-3">
              {reasons.map((reasonOption) => (
                <label key={reasonOption.value} className="flex items-center">
                  <input
                    type="radio"
                    name="reason"
                    value={reasonOption.value}
                    checked={reason === reasonOption.value}
                    onChange={(e) => setReason(e.target.value)}
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                  />
                  <span className="ml-3 text-sm text-gray-700">
                    {reasonOption.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Details (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={1000}
              placeholder="Provide additional context about why you're reporting this post..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
            />
            <p className="mt-1 text-xs text-gray-500">
              {description.length}/1000 characters
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!reason.trim() || isSubmitting}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? "Submitting..." : "Submit Report"}
            </button>
          </div>
        </form>
        )}
      </div>
    </div>
  );
};

export default ReportModal;