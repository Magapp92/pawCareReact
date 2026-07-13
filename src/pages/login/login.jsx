
import { useRef, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../../context/auth-context'
import "./login.css"

export const Login = () => {
    
    const { iniciarSesion } = useContext( AuthContext )

    const navigate = useNavigate()

    const { VITE_EXPRESS } = import.meta.env

    const formulario = useRef(null)

    const entrar = async ( e ) => {
        e.preventDefault()
     
        const { email, password, perfil } = formulario.current

        const datos = {
            email: email.value,
            password: password.value,
            rol: perfil.value
        }

        const options = {
            method: 'POST',
            headers: {
                "Content-type" : "application/json"
            },
            body : JSON.stringify( datos )
        }

        const peticion = await fetch( `${VITE_EXPRESS}/login`, options )

        const { data } = await peticion.json()

        if ( data ) {

        iniciarSesion( data )

        if ( data.rol === 'cuidador' ){
            navigate('/panel')
        } else {
            navigate('/')
        }
        }
    }

    return (
    <> 
        <main className="Login">
          {/* Imagen de fondo de la pantalla, decorativa */}
          <img className="Login-fondo" src="/fondo_login.webp" alt="" />
          <form className="Login-card" ref={formulario} onSubmit={entrar}>
            <h1 className="Login-h1">
                <img className="Login-logoImg" src="/PawCare.png" alt="fondo" />
                PawCare
            </h1>
            <p className="Login-subtitulo">Bienvenido a tu comunidad PawCare</p>
            <label className="Login-email">
                <span>Correo electrónico</span>
                <input type="email" name="email" placeholder="email@email.com" required />
            </label>
             <label className="Login-contrasena">
                <span>Contraseña</span>
                <input type="password" name="password" placeholder="Tu contraseña" required />
            </label>
            <label className="Login-perfil">
                <span>Tipo de perfil</span>
                  <select name="perfil" defaultValue="" required>
                    {/* hidden oculta el placeholder dentro de la lista desplegable */}
                    <option value="" disabled hidden>Selecciona tu perfil</option>
                    <option value="usuario">Usuario con mascota</option>
                    <option value="cuidador">Cuidador</option>
                  </select>
            </label>
            <button className="Login-boton" type="submit">Iniciar sesión</button>
          </form>
        </main>
    </>
    )
}
