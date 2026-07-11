
import './aviso-legal.css'

export const AvisoLegal = () => {

    return (
        <main className="AvisoLegal">
            <h1>Aviso legal</h1>

            <h2>Titularidad del sitio</h2>
            <p>
                PawCare es una aplicación web desarrollada como proyecto académico para el
                Bootcamp Fullstack. No constituye un servicio comercial real: los cuidadores,
                precios y reservas que se muestran son datos de demostración.
            </p>

            <h2>Condiciones de uso</h2>
            <p>
                El acceso a la aplicación es gratuito y requiere registro. El usuario se
                compromete a hacer un uso adecuado de la plataforma y a no introducir datos
                falsos o de terceros sin su consentimiento.
            </p>

            <h2>Propiedad intelectual</h2>
            <p>
                El código, los textos y el diseño de PawCare pertenecen a su autor. Las
                imágenes utilizadas tienen fines exclusivamente ilustrativos.
            </p>

            <h2>Responsabilidad</h2>
            <p>
                Al tratarse de un proyecto formativo, no se garantiza la disponibilidad del
                servicio ni se asume responsabilidad alguna por el uso de la información
                mostrada.
            </p>
        </main>
    )
}
