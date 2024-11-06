"use client";

import {useAuth} from 'app/context/AuthContext'
import React from 'react'

export default function page() {

    const {state} = useAuth();
  return (
      <div>user page {state.user?.firstName}</div>
  )
}
