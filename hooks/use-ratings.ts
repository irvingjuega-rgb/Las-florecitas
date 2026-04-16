"use client"

import { useState, useEffect, useCallback } from "react"
import { Rating, calculateTotalScore, proposals as mockProposals } from "@/lib/proposals-data"

const STORAGE_KEY = "mc-proposal-ratings"

export function useRatings(user?: { username: string, role: string }) {
  const [ratings, setRatings] = useState<Rating[]>([])
  const [globalRatings, setGlobalRatings] = useState<Rating[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  const fetchRatings = useCallback(async () => {
    try {
      const timestamp = Date.now();
      
      // 1. Siempre obtener los promedios globales para las StatsCards
      const globalRes = await fetch(`/api/calificaciones?t=${timestamp}`, {
        cache: 'no-store',
        headers: { 'Pragma': 'no-cache', 'Cache-Control': 'no-cache' }
      });
      
      let currentGlobal: Rating[] = [];
      if (globalRes.ok) {
        const { data } = await globalRes.json();
        currentGlobal = Array.isArray(data) ? data.map((row: any) => {
          const ratingObj = {
            proposalId: row.proposalId,
            costoBeneficio: row.costoBeneficio || 5,
            usoIA: row.usoIA || 5,
            impactoCliente: row.impactoCliente || 5,
            facilidadImplementacion: row.facilidadImplementacion || 5,
            escalabilidad: row.escalabilidad || 5
          };
          return { ...ratingObj, totalScore: calculateTotalScore(ratingObj as any) };
        }) : [];
        setGlobalRatings(currentGlobal);
      }

      // 2. Obtener calificaciones personales si hay un usuario
      if (user?.username) {
        const personalRes = await fetch(`/api/calificaciones?username=${encodeURIComponent(user.username)}&t=${timestamp}`, {
          cache: 'no-store',
          headers: { 'Pragma': 'no-cache', 'Cache-Control': 'no-cache' }
        });
        
        if (personalRes.ok) {
          const { data, isMock } = await personalRes.json();
          
          if ((!data || data.length === 0) && isMock) {
            // Modo demo: generar algunas si no hay nada
            const generatedRatings: Rating[] = mockProposals.slice(0, 5).map(p => {
              const r = {
                proposalId: p.id,
                costoBeneficio: 7, usoIA: 8, impactoCliente: 7, facilidadImplementacion: 6, escalabilidad: 7,
              };
              return { ...r, totalScore: calculateTotalScore(r) };
            });
            setRatings(generatedRatings);
          } else {
            const formatted = Array.isArray(data) ? data.map((row: any) => {
              const ratingObj = {
                proposalId: row.proposalId,
                costoBeneficio: row.costoBeneficio || 5,
                usoIA: row.usoIA || 5,
                impactoCliente: row.impactoCliente || 5,
                facilidadImplementacion: row.facilidadImplementacion || 5,
                escalabilidad: row.escalabilidad || 5
              };
              return { ...ratingObj, totalScore: calculateTotalScore(ratingObj as any) };
            }) : [];
            setRatings(formatted);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching ratings:", error);
    } finally {
      setIsLoaded(true);
    }
  }, [user]);

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

  const getGlobalRating = useCallback((proposalId: string): Rating | undefined => {
    return globalRatings.find(r => r.proposalId === proposalId)
  }, [globalRatings])


  return {
    ratings,
    globalRatings,
    isLoaded,
    saveRating,
    getRating,
    getGlobalRating
  }
}
