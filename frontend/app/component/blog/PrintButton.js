"use client";

import { useState } from "react";

export default function PrintButton({ className = "" }) {
  const [isPrinting, setIsPrinting] = useState(false);

  const handlePrint = () => {
    setIsPrinting(true);
    
    // Add print-specific styles
    const printStyles = `
      <style>
        @media print {
          /* Hide navigation and other non-essential elements */
          nav, .no-print, .print-hidden {
            display: none !important;
          }
          
          /* Optimize layout for print */
          body {
            font-size: 12pt;
            line-height: 1.5;
            color: #000;
            background: #fff;
          }
          
          /* Ensure proper page breaks */
          .print-page-break {
            page-break-before: always;
          }
          
          /* Optimize images for print */
          img {
            max-width: 100% !important;
            height: auto !important;
          }
          
          /* Style links for print */
          a {
            color: #000 !important;
            text-decoration: underline !important;
          }
          
          /* Hide interactive elements */
          button, .interactive {
            display: none !important;
          }
          
          /* Optimize typography */
          h1, h2, h3, h4, h5, h6 {
            page-break-after: avoid;
            color: #000 !important;
          }
          
          /* Ensure content fits well */
          .container, .max-w-4xl, .max-w-6xl {
            max-width: none !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          
          /* Style the article content */
          article {
            margin: 0 !important;
            padding: 20pt !important;
          }
          
          /* Hide social sharing and interactive elements */
          .social-share, .like-button, .comment-form {
            display: none !important;
          }
        }
      </style>
    `;
    
    // Add print styles to head
    const styleElement = document.createElement('div');
    styleElement.innerHTML = printStyles;
    document.head.appendChild(styleElement.firstChild);
    
    // Trigger print
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
      
      // Remove print styles after printing
      setTimeout(() => {
        const printStyleElement = document.querySelector('style:last-child');
        if (printStyleElement && printStyleElement.textContent.includes('@media print')) {
          printStyleElement.remove();
        }
      }, 1000);
    }, 100);
  };

  return (
    <button
      onClick={handlePrint}
      disabled={isPrinting}
      className={`inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      title="Print this article"
    >
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
      </svg>
      {isPrinting ? 'Preparing...' : 'Print'}
    </button>
  );
}