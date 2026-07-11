
import { useContext, useEffect, lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import './app.css'

import { Header } from './components/header/header.jsx'
import { Footer } from './components/footer/footer.jsx'
import { VerificacionRuta } from './components/verificacion-ruta/verificacion-ruta.jsx'
import { AuthContext } from './context/auth-context.jsx'
import { AuthProvider } from './context/auth-context.jsx'

/* Cada página se carga con lazy solo cuando se visita su ruta; como usamos
exports con nombre, el then los convierte al default que lazy espera */
const Login = lazy( () => import('./pages/login/login.jsx').then( ({ Login }) => ({ default: Login }) ) )
const Inicio = lazy( () => import('./pages/inicio/inicio.jsx').then( ({ Inicio }) => ({ default: Inicio }) ) )
const Cuidador = lazy( () => import('./pages/cuidador/cuidador.jsx').then( ({ Cuidador }) => ({ default: Cuidador }) ) )
const PerfilCuidador = lazy( () => import('./pages/perfil-cuidador/perfil-cuidador.jsx').then( ({ PerfilCuidador }) => ({ default: PerfilCuidador }) ) )
const Reservas = lazy( () => import('./pages/reservas/reservas.jsx').then( ({ Reservas }) => ({ default: Reservas }) ) )
const PerfilUsuario = lazy( () => import('./pages/perfil-usuario/perfil-usuario.jsx').then( ({ PerfilUsuario }) => ({ default: PerfilUsuario }) ) )
const AvisoLegal = lazy( () => import('./pages/aviso-legal/aviso-legal.jsx').then( ({ AvisoLegal }) => ({ default: AvisoLegal }) ) )
const Privacidad = lazy( () => import('./pages/privacidad/privacidad.jsx').then( ({ Privacidad }) => ({ default: Privacidad }) ) )

/* Envolvemos la app con el AuthProvider para compartir la sesión y con el BrowserRouter para las rutas */
const App = () => {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Wrapper />
            </BrowserRouter>
        </AuthProvider>
    )
}

export default App

/* En el Wrapper agrupamos el Header, las rutas dentro del main y el Footer;
si hay sesión iniciada redirigimos fuera del login según el rol */
const Wrapper = () => {

    const location = useLocation()
    const navigate = useNavigate()
    const { usuario } = useContext(AuthContext)

    useEffect(() => {

        if (usuario?.rol === 'cuidador' && location.pathname === '/login') {
            navigate('/panel')
        } else if (usuario && location.pathname === '/login') {
            navigate('/')
        }
    }, [usuario, location])

    return (
        <div className="AppLayout">
            <Header/>
            <main className="AppLayout-main">
                {/* Las rutas privadas van envueltas en VerificacionRuta que exige sesión iniciada;
                el Suspense muestra el fallback mientras se descarga la página lazy */}
                <Suspense fallback={ <p className="AppLayout-cargando">Cargando...</p> }>
                    <Routes>
                        <Route path="/login" element={ <Login /> } />
                        <Route path="/" element={ <VerificacionRuta><Inicio /></VerificacionRuta> } />
                        <Route path="/cuidador/:id" element={ <VerificacionRuta><Cuidador /></VerificacionRuta> } />
                        <Route path="/panel" element={ <VerificacionRuta><PerfilCuidador /></VerificacionRuta> } />
                        <Route path="/mis-reservas" element={ <VerificacionRuta><Reservas /></VerificacionRuta> } />
                        <Route path="/perfil" element={ <VerificacionRuta><PerfilUsuario /></VerificacionRuta> } />
                        <Route path="/Aviso-legal" element={ <AvisoLegal /> } />
                        <Route path="/Privacidad" element={ <Privacidad /> } />
                    </Routes>
                </Suspense>
            </main>
            <Footer/>
        </div>
    )
}
