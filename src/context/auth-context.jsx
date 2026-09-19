
import { createContext, useState } from 'react'

export const AuthContext = createContext()

/* Leemos la sesión guardada solo en el primer render; si alguien ha dejado
un valor mal formado en localStorage lo borramos en vez de romper la app */
const leerSesion = () => {
    try {
        return JSON.parse( localStorage.getItem('usuario') )
    } catch {
        localStorage.removeItem('usuario')
        return null
    }
}

export const AuthProvider = ({ children }) => {

    const [ usuario, setUsuario ] = useState( leerSesion )

    const iniciarSesion = (datos) => {

        localStorage.setItem('usuario', JSON.stringify(datos))
        /* El token va en su propia clave para que las peticiones lo lean sin parsear la sesión */
        localStorage.setItem('token', datos.token)

        setUsuario(datos)
    }

    const cerrarSesion = () => {

        localStorage.removeItem('usuario')
        localStorage.removeItem('token')
        
        setUsuario(null)
    }

    return (
        <AuthContext.Provider value={{ usuario, iniciarSesion, cerrarSesion }}>
            {children}
        </AuthContext.Provider>
    )
}
