"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react"

interface AuthContextType {
    isAuthenticated: boolean
    login: (usuario: string, contrasena: string) => boolean
    logout: () => void
    isLoaded: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const STORAGE_KEY = "mc-auth-status"

export function AuthProvider({ children }: { children: ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
    const [isLoaded, setIsLoaded] = useState<boolean>(false)

    useEffect(() => {
        // Verificar si hay una sesion guardada al cargar
        const storedAuth = localStorage.getItem(STORAGE_KEY)
        if (storedAuth === "true") {
            setIsAuthenticated(true)
        }
        setIsLoaded(true)
    }, [])

    const login = (usuario: string, contrasena: string) => {
        // Lista de usuarios permitidos (Añade más usuarios aquí)
        const usuariosPermitidos = [
            { user: "admin", pass: "admin123" },
            { user: "agongora", pass: "agongora123" },
            // Ejemplo de cómo agregar otro usuario:
            // { user: "nuevo_usuario", pass: "su_contrasena" },
        ]

        // Verificar si las credenciales existen en la lista
        const isValid = usuariosPermitidos.some(
            (u) => u.user === usuario && u.pass === contrasena
        )

        if (isValid) {
            setIsAuthenticated(true)
            localStorage.setItem(STORAGE_KEY, "true")
            return true
        }
        return false
    }

    const logout = () => {
        setIsAuthenticated(false)
        localStorage.removeItem(STORAGE_KEY)
    }

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout, isLoaded }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error("useAuth debe usarse dentro de un AuthProvider")
    }
    return context
}
