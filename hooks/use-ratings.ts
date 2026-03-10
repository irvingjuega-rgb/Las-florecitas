"use client"

import { useState, useEffect, useCallback } from "react"
import { Rating, calculateTotalScore } from "@/lib/proposals-data"

const STORAGE_KEY = "mc-proposal-ratings"

export function useRatings() {
  const [ratings, setRatings] = useState<Rating[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  const fetchRatings = useCallback(async () => {
    try {
      const res = await fetch("/api/calificaciones")
      if (res.ok) {
        const { data } = await res.json()

        // Transform the DB averages back to the Rating format
        const formattedRatings: Rating[] = data.map((row: any) => {
          const ratingObj = {
            proposalId: row.proposalId,
            costoBeneficio: row.costoBeneficio || 5, // fallback if null
            usoIA: row.usoIA || 5,
            impactoCliente: row.impactoCliente || 5,
            facilidadImplementacion: row.facilidadImplementacion || 5,
            escalabilidad: row.escalabilidad || 5
          }
          return {
            ...ratingObj,
            totalScore: calculateTotalScore(ratingObj as any)
          }
        })
        setRatings(formattedRatings)
      }
    } catch (error) {
      console.error("Error fetching ratings:", error)
    } finally {
      setIsLoaded(true)
    }
  }, [])

  useEffect(() => {
    fetchRatings()
  }, [fetchRatings])

  const saveRating = useCallback(async (rating: Omit<Rating, 'totalScore'>) => {
    try {
      const res = await fetch("/api/calificaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rating),
      })

      if (res.ok) {
        // Optimistically update or refetch
        await fetchRatings()
      } else {
        const errorText = await res.text()
        console.error("Failed to save rating:", errorText)
      }
    } catch (error) {
      console.error("Error posting rating:", error)
    }
  }, [fetchRatings])

  const getRating = useCallback((proposalId: string): Rating | undefined => {
    return ratings.find(r => r.proposalId === proposalId)
  }, [ratings])


  return {
    ratings,
    isLoaded,
    saveRating,
    getRating
  }
}
