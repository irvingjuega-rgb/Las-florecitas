"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react"

interface User {
    username: string
    role: "admin" | "user"
}

interface AuthContextType {
    isAuthenticated: boolean
    user: User | null
    login: (usuario: string, contrasena: string) => boolean
    logout: () => void
    isLoaded: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const STORAGE_KEY = "mc-auth-status"
const USER_KEY = "mc-auth-user"

export function AuthProvider({ children }: { children: ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
    const [user, setUser] = useState<User | null>(null)
    const [isLoaded, setIsLoaded] = useState<boolean>(false)

    useEffect(() => {
        // Verificar si hay una sesion guardada al cargar
        const storedAuth = localStorage.getItem(STORAGE_KEY)
        const storedUser = localStorage.getItem(USER_KEY)

        if (storedAuth === "true" && storedUser) {
            setIsAuthenticated(true)
            setUser(JSON.parse(storedUser))
        }
        setIsLoaded(true)
    }, [])

    const login = (usuario: string, contrasena: string) => {
        // Lista de usuarios con roles
        const usuariosPermitidos = [
            { user: "Admin", pass: "Admin123", role: "admin" as const },
            { user: "agongora", pass: "agongora123", role: "admin" as const },
            { user: "scots", pass: "SC123", role: "user" as const },
            { user: "mcastillo", pass: "MC123", role: "user" as const },
            { user: "oguizar", pass: "OG123", role: "user" as const },
            { user: "jcasanueva", pass: "JC123", role: "user" as const },
            { user: "evelazquez", pass: "EV123", role: "user" as const },
            { user: "mjimenez", pass: "MJ123", role: "user" as const },
            { user: "hgasca", pass: "HG123", role: "user" as const },
            { user: "jlozano", pass: "JL123", role:"user" as const},
        ]

        // Verificar si las credenciales existen en la lista
        const foundUser = usuariosPermitidos.find(
            (u) => u.user === usuario && u.pass === contrasena
        )

        if (foundUser) {
            const userData = { username: foundUser.user, role: foundUser.role }
            setIsAuthenticated(true)
            setUser(userData)
            localStorage.setItem(STORAGE_KEY, "true")
            localStorage.setItem(USER_KEY, JSON.stringify(userData))
            return true
        }
        return false
    }

    const logout = () => {
        setIsAuthenticated(false)
        setUser(null)
        localStorage.removeItem(STORAGE_KEY)
        localStorage.removeItem(USER_KEY)
    }

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, login, logout, isLoaded }}>
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
