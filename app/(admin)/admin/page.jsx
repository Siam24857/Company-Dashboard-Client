'use client'
import { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api'
import AdminCommandCenter from '@/components/dashboard/AdminCommandCenter'
import { cn } from '@/lib/utils'

export default function AdminHomePage() {
  return <AdminCommandCenter />
}