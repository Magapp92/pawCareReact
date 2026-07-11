
import { useContext } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { AuthContext } from '../../context/auth-context.jsx'
import './header.css'

export const Header = () => {

    const { usuario, cerrarSesion } = useContext( AuthContext )
    const navigate = useNavigate()
    const location = useLocation()

    /* Visible en todas las rutas menos el login; derivado de la ruta, sin estado */
    const visible = location.pathname !== '/login'

    const esCuidador = usuario?.rol === 'cuidador'

    const salir = () => {
        cerrarSesion()
        navigate('/login')
    }   

    return (

      <>
      {/* En el header agrupamos el logo, los links de navegación según el rol y el botón de salir;
      se oculta en la página de login */}
      {visible &&
        <header className="Header">
          <div className="Header-inner">
            {/* alt vacío: imagen decorativa, el enlace ya dice PawCare */}
            <NavLink to={esCuidador ? '/panel' : '/'} className="Header-logo">
                <img className="Header-logoImg" src="/PawCare.png" alt="" />
                PawCare
            </NavLink>
              {/* El cuidador no tiene links de navegación: solo logo y salir */}
              { !esCuidador &&
                <nav className="Header-links">
                    <NavLink to="/" end className="Header-link">Inicio</NavLink>
                    <NavLink to="/mis-reservas" className="Header-link">Mis reservas</NavLink>
                    <NavLink to="/perfil" className="Header-link">Mi perfil</NavLink>
                </nav>
              }
                <button className="Header-salir" type="button" onClick={salir}>Salir</button>
          </div>
        </header>
      }
      </>
    )
}