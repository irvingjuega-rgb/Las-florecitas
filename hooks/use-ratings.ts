"use client"

import { useState, useEffect, useCallback } from "react"
import { Rating, calculateTotalScore } from "@/lib/proposals-data"

const STORAGE_KEY = "mc-proposal-ratings"

export function useRatings() {
  const [ratings, setRatings] = useState<Rating[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        setRatings(JSON.parse(stored))
      } catch {
        setRatings([])
      }
    }
    setIsLoaded(true)
  }, [])

  const saveRating = useCallback((rating: Omit<Rating, 'totalScore'>) => {
    const totalScore = calculateTotalScore(rating)
    const newRating: Rating = { ...rating, totalScore }
    
    setRatings(prev => {
      const existingIndex = prev.findIndex(r => r.proposalId === rating.proposalId)
      let updated: Rating[]
      
      if (existingIndex >= 0) {
        updated = [...prev]
        updated[existingIndex] = newRating
      } else {
        updated = [...prev, newRating]
      }
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      return updated
    })
  }, [])

  const getRating = useCallback((proposalId: string): Rating | undefined => {
    return ratings.find(r => r.proposalId === proposalId)
  }, [ratings])

  const clearAllRatings = useCallback(() => {
    setRatings([])
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  return {
    ratings,
    isLoaded,
    saveRating,
    getRating,
    clearAllRatings
  }
}
