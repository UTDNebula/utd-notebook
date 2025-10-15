"use client";

import { FaSearch, FaPlus } from "react-icons/fa";

const recentFiles = [
  { title: "CS 1200 Notes" },
  { title: "MATH 2413 Homework" },
  { title: "PHYS 2325 Study Guide" },
  { title: "HIST 1301 Outline" },
  { title: "ENGR 2300 Lab Report" },
  { title: "STAT 2332 Review" },
  { title: "CS 2336 Quiz Prep" },
  { title: "GOVT Exam Review" },
];

const cs3345Files = [
  { title: "Lecture 1" },
  { title: "Lecture 2" },
  { title: "Lecture 3" },
  { title: "Homework 1" },
  { title: "Homework 2" },
  { title: "Project Guidelines" },
  { title: "Exam 1 Review" },
  { title: "Exam 2 Review" },
];

export default function FileCardGrid() {
  return (
    <div
      className="relative min-h-screen w-full bg-cover bg-center text-white"
      style={{ backgroundImage: "url('/background.png')" }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Sticky Header */}
      <header className="sticky top-0 z-20 w-full border-b border-white/10 bg-black/40 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          {/* Logo */}
          <h1 className="text-lg font-bold tracking-wide">UTD Notebook</h1>

          {/* Search bar */}
          <div className="flex flex-1 max-w-xl items-center gap-2 rounded-lg border border-white/20 bg-white/10 p-2 mx-6">
            <FaSearch className="text-gray-300" />
            <input
              type="text"
              placeholder="Search Notes"
              className="w-full bg-transparent px-2 text-white placeholder-gray-400 focus:outline-none"
            />
          </div>

          {/* Profile */}
          <button className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/20">
            Profile
          </button>
        </div>
      </header>

      {/* Grid Content */}
      <main className="relative z-10 mx-auto max-w-7xl px-6 py-10">
        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
            {/* Filter 1 */}
            <select className="rounded-md bg-white/10 backdrop-blur-md px-4 py-2 text-white placeholder-gray-400 focus:outline-none hover:bg-white/20 transition">
            <option>Most Recent</option>
            <option>Most Liked</option>
            <option>Most Viewed</option>
            </select>

            {/* Filter 2 */}
            <select className="rounded-md bg-white/10 backdrop-blur-md px-4 py-2 text-white placeholder-gray-400 focus:outline-none hover:bg-white/20 transition">
            <option>All Subjects</option>
            <option>CS</option>
            <option>MATH</option>
            <option>PHYS</option>
            <option>ENGR</option>
            <option>HIST</option>
            </select>
        </div>
        
        {/* Recent Notes */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Recent Notes</h2>
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {recentFiles.map((file, index) => (
              <div
                key={index}
                className="rounded-lg bg-white/10 backdrop-blur-md p-4 shadow-md hover:shadow-xl hover:scale-105 transition-transform duration-300 cursor-pointer"
              >
                <h3 className="text-white font-semibold">{file.title}</h3>
                <p className="text-sm text-gray-300 mt-1">Preview text</p>
              </div>
            ))}
          </div>
        </section>

        {/* CS 3345 Notes */}
        <section>
          <h2 className="text-2xl font-bold mb-4">CS 3345 Notes</h2>
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {cs3345Files.map((file, index) => (
              <div
                key={index}
                className="rounded-lg bg-white/10 backdrop-blur-md p-4 shadow-md hover:shadow-xl hover:scale-105 transition-transform duration-300 cursor-pointer"
              >
                <h3 className="text-white font-semibold">{file.title}</h3>
                <p className="text-sm text-gray-300 mt-1">Preview text</p>
              </div>
            ))}
          </div>
        </section>

        {/* Floating Add Button */}
        <button className="
        fixed bottom-6 right-6 flex h-20 w-20 items-center justify-center 
        rounded-full bg-cornflower-500 text-white shadow-lg 
        transition-transform duration-200 
        hover:bg-cornflower-600 hover:scale-110 hover:shadow-2xl
        ">
        <FaPlus className="text-3xl" />
        </button>
      </main>
    </div>
  );
}
