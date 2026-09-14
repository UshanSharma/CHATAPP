import React from 'react'
import { Link, Outlet } from 'react-router-dom'
import "./rootLayout.css"

import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton
} from '@clerk/clerk-react'

const RootLayout = () => {
  return (
    <div className="rootLayout">
      <header>
        <Link to="/" className="logo">
          <img src="/logo.png" alt="" />
          <span>CHAT APP</span>
        </Link>
        <div className="user">
          <SignedIn>
            <UserButton />
          </SignedIn>

          <SignedOut>
          </SignedOut>
        </div>
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  )
}

export default RootLayout