
import { Link, useLocation } from 'react-router-dom'
import "./footer.css"

export const Footer = () => {

    const location = useLocation()

    /* Visible en todas las rutas menos el login; derivado de la ruta, sin estado */
    const visible = location.pathname !== '/login'


    return(
        <>
        {/* En el footer agrupamos la marca, los enlaces legales y el contacto;
        se oculta en la página de login */}
        { visible &&
            <footer className="Footer">
               <div className="Footer-inner">
                  <div className="Footer-columnas">
                    <div className="Footer-col">
                      {/* alt vacío: imagen decorativa, el título ya dice PawCare */}
                      <h3 className="Footer-h3">
                        <img className="Footer-logoImg" src="/PawCare.png" alt="" />
                        PawCare
                      </h3>
                    </div>
                    <div className="Footer-col">
                      <h4 className="Footer-h4">Legal</h4>
                      <Link to="/Aviso-legal">Aviso legal</Link>
                      <Link to="/Privacidad">Politica de privacidad</Link>
                    </div>
                    <div className="Footer-col">
                      <h4 className="Footer-h4">Contacto</h4>
                      <span>info@pawcare.com</span>
                      <span>912345678</span>
                    </div>
                  </div>
                  <p className="Footer-copy">© 2026 PawCare. Todos los derechos reservados.</p>
                </div>
            </footer>
        }         
        </>

    )
}