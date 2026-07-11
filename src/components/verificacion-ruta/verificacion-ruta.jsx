
import { useContext } from 'react'
import { Navigate } from 'react-router-dom'
import { AuthContext } from '../../context/auth-context'

export const VerificacionRuta = ({ children }) => {

    const { usuario } = useContext(AuthContext)

    if (!usuario) {
        return <Navigate to="/login" replace />
    }

    return children
}
