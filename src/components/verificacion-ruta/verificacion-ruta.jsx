
import { useContext } from 'react'
import { Navigate } from 'react-router-dom'
import { AuthContext } from '@context/auth-context'

/* Envuelve las páginas privadas: recibe la página por children y solo la muestra si hay sesión */
export const VerificacionRuta = ({ children }) => {

    const { usuario } = useContext(AuthContext)

    /* Sin sesión iniciada mandamos al login en vez de mostrar la página */
    if (!usuario) {
        return <Navigate to="/login" replace />
    }

    return children
}
