'use client';
import React from 'react';
import { useState } from 'react';

export default function UploadNotes() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-block cursor-pointer hover:underline"
      >
        Upload Notes
      </button>

      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center">
          <div className="w-80 bg-white p-6 text-center">
            <h2 className="mb-4 text-xl font-semibold text-black">
              Upload Notes
            </h2>
            <p className="mb-6 border-black text-black">
              Enter Filename:{' '}
              <input
                type="text"
                className="mt-2 w-full border border-black px-2 py-1"
              />
            </p>
            <p className="mb-6 border-black text-black">
              Section Dropdown:{' '}
              <select className="mt-2 w-full border border-black px-2 py-1 text-black">
                <option value="">Select a section</option>
                <option value="section1">CS 1200</option>
                <option value="section2">CS 1436</option>
                <option value="section3">CS 1337</option>
              </select>
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setIsOpen(false)}
                className="border border-black px-2 py-1 text-black"
              >
                Cancel
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="border border-black px-2 py-1 text-black"
              >
                Upload
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
