"use client"

import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/contexts/auth-context"
import { KeyRound, User } from "lucide-react"

interface LoginDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    isStatic?: boolean
}

export function LoginDialog({ open, onOpenChange, isStatic = false }: LoginDialogProps) {
    const [usuario, setUsuario] = useState("")
    const [contrasena, setContrasena] = useState("")
    const [error, setError] = useState(false)
    const { login } = useAuth()

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault()
        const success = login(usuario, contrasena)
        if (success) {
            setError(false)
            setUsuario("")
            setContrasena("")
            onOpenChange(false)
        } else {
            setError(true)
        }
    }

    // Resetea el error cuando el modal se cierra o abre
    const handleOpenChange = (newOpen: boolean) => {
        if (!newOpen) {
            setError(false)
            setUsuario("")
            setContrasena("")
        }
        onOpenChange(newOpen)
    }

    const LoginForm = (
        <form onSubmit={handleLogin} className="space-y-4 pt-4">
            <div className="space-y-2">
                <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        id="usuario"
                        placeholder="Usuario"
                        value={usuario}
                        onChange={(e) => setUsuario(e.target.value)}
                        className="pl-9 h-11"
                        autoComplete="username"
                    />
                </div>
            </div>
            <div className="space-y-2">
                <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        id="contrasena"
                        type="password"
                        placeholder="Contraseña"
                        value={contrasena}
                        onChange={(e) => setContrasena(e.target.value)}
                        className="pl-9 h-11"
                        autoComplete="current-password"
                    />
                </div>
                {error && (
                    <p className="text-sm text-destructive mt-1 font-medium">
                        Credenciales incorrectas. Intenta de nuevo.
                    </p>
                )}
            </div>
            <div className="flex justify-end pt-4">
                <Button type="submit" className="w-full h-11 rounded-xl shadow-sm">
                    Ingresar al Sistema
                </Button>
            </div>
        </form>
    )

    if (isStatic) {
        return <div className="w-full">{LoginForm}</div>
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[425px] rounded-2xl border-none shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">Iniciar Sesión</DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        Ingresa tus credenciales para administrar propuestas de mejora.
                    </DialogDescription>
                </DialogHeader>
                {LoginForm}
            </DialogContent>
        </Dialog>
    )
}
