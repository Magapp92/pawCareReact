
import { createContext, useState } from 'react'

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {

    const [ usuario, setUsuario ] = useState(JSON.parse(localStorage.getItem('usuario')))

    const iniciarSesion = (datos) => {

        localStorage.setItem('usuario', JSON.stringify(datos))

        setUsuario(datos)
    }

    const cerrarSesion = () => {

        localStorage.removeItem('usuario')
        
        setUsuario(null)
    }

    return (
        <AuthContext.Provider value={{ usuario, iniciarSesion, cerrarSesion }}>
            {children}
        </AuthContext.Provider>
    )
}