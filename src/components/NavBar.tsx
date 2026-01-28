'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { IconButton } from '@mui/material';
import {
  InfoOutlined as InfoIcon,
  HelpOutline as HelpIcon,
  Share as ShareIcon,
} from '@mui/icons-material';
import ProfileDropdown from './ProfileDropdown';

export default function NavBar() {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Searching for:', searchQuery);
  };

  return (
    <nav className="relative flex items-center gap-4 overflow-hidden px-4 py-3 md:px-8 lg:px-16" style={{
      background: 'linear-gradient(to right, #C1C3FF, #DEBCF2, #FFC6C1)'
    }}>

      {/* Logo */}
      <Link
        href="/"
        className="font-display flex flex-shrink-0 items-center gap-2 text-lg font-bold md:text-xl"
      >
        <Image
          src="/icon-white.svg"
          alt="UTD Notebook Logo"
          width={32}
          height={32}
          className="h-8 w-8"
        />
        UTD NOTEBOOK
      </Link>

      {/* Search Bar */}
      <form
        onSubmit={handleSearch}
        className="flex max-w-2xl flex-1 items-center gap-2"
      >
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ex. GOVT 2306"
          className="flex-1 rounded-lg border-2 border-white bg-white px-4 py-2 transition-all focus:border-cornflower-500 focus:outline-none"
          style={{ color: '#6B7280' }}
        />
        <button
          type="submit"
          className="rounded-lg px-6 py-2 font-semibold text-white transition-colors"
          style={{ backgroundColor: '#573DFF' }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4532CC'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#573DFF'}
        >
          Search
        </button>
      </form>

      {/* Right Side Icons */}
      <div className="ml-auto flex items-center gap-2">
        <IconButton
          size="medium"
          sx={{ color: '#ffffff', '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' } }}
          aria-label="Info"
        >
          <InfoIcon />
        </IconButton>

        <IconButton
          size="medium"
          sx={{ color: '#ffffff', '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' } }}
          aria-label="Help"
        >
          <HelpIcon />
        </IconButton>

        <IconButton
          size="medium"
          sx={{ color: '#ffffff', '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' } }}
          aria-label="Share"
        >
          <ShareIcon />
        </IconButton>

        <ProfileDropdown />
      </div>
    </nav>
  );
}
