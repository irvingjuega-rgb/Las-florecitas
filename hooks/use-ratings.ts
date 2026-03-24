"use client"

import { useState, useEffect, useCallback } from "react"
import { Rating, calculateTotalScore, proposals as mockProposals } from "@/lib/proposals-data"

const STORAGE_KEY = "mc-proposal-ratings"

export function useRatings(username?: string) {
  const [ratings, setRatings] = useState<Rating[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  const fetchRatings = useCallback(async () => {
    try {
      const url = username 
        ? `/api/calificaciones?username=${encodeURIComponent(username)}&t=${Date.now()}`
        : `/api/calificaciones?t=${Date.now()}`;
        
      const res = await fetch(url, {
        cache: 'no-store',
        headers: {
          'Pragma': 'no-cache',
          'Cache-Control': 'no-cache'
        }
      })
      if (res.ok) {
        const { data, isMock } = await res.json()

        if ((!data || data.length === 0) && isMock) {
          // Generar calificaciones de prueba si estamos en modo demo y no hay datos
          const generatedRatings: Rating[] = mockProposals.slice(0, 10).map(p => {
            const r = {
              proposalId: p.id,
              costoBeneficio: Math.floor(Math.random() * 4) + 6, // 6-9
              usoIA: Math.floor(Math.random() * 5) + 5, // 5-9
              impactoCliente: Math.floor(Math.random() * 3) + 7, // 7-9
              facilidadImplementacion: Math.floor(Math.random() * 5) + 5,
              escalabilidad: Math.floor(Math.random() * 4) + 6,
            }
            return {
              ...r,
              totalScore: calculateTotalScore(r)
            }
          })
          setRatings(generatedRatings)
        } else {
          // Transform the DB averages back to the Rating format
          const formattedRatings: Rating[] = Array.isArray(data) ? data.map((row: any) => {
            const ratingObj = {
              proposalId: row.proposalId,
              costoBeneficio: row.costoBeneficio || 5,
              usoIA: row.usoIA || 5,
              impactoCliente: row.impactoCliente || 5,
              facilidadImplementacion: row.facilidadImplementacion || 5,
              escalabilidad: row.escalabilidad || 5
            }
            return {
              ...ratingObj,
              totalScore: calculateTotalScore(ratingObj as any)
            }
          }) : []
          setRatings(formattedRatings)
        }
      }
    } catch (error) {
      console.error("Error fetching ratings:", error)
    } finally {
      setIsLoaded(true)
    }
  }, [username])

  useEffect(() => {
    fetchRatings()
  }, [fetchRatings])

  const saveRating = useCallback(async (rating: Omit<Rating, 'totalScore'>, username?: string) => {
    try {
      const res = await fetch("/api/calificaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...rating, username }),
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
