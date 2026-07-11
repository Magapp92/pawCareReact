
import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Reservar } from '../../components/reservar/reservar'
import { Comentarios } from '../../components/comentarios/comentarios'
import { obtenerPrecioServicio } from '../../components/precios/precios'
import { NOMBRES_SERVICIO, CLAVES_SERVICIO } from '../../const/servicios'
import './cuidador.css'

export const Cuidador = () => {

    const { VITE_EXPRESS } = import.meta.env
    const { id } = useParams()

    const [ cuidador, setCuidador ] = useState( null )

    const getCuidador = async () => {

        const peticion = await fetch(`${VITE_EXPRESS}/cuidadores/${ id }`)
        const { data } = await peticion.json()

        setCuidador( data )
    }

    useEffect(() => {
        getCuidador()
    }, [])

    if (!cuidador) {
        return <p className="Perfil-cargando">Cargando...</p>
    }

    const {
        nombre, avatarUrl, edad, ubicacion, experienciaAnos, animalesQueAtiende, servicios, preciosPorServicio
     } = cuidador

    /* Servicios activos del cuidador: filtramos el catálogo fijo, como en el panel y el modal */
    const activos = CLAVES_SERVICIO.filter( clave => servicios[clave] )

    return(

       <main className="Perfil">
        <Link to="/" className="Perfil-volver">Volver a la búsqueda</Link>
        {/* En la cabecera agrupamos la foto, los datos principales y el botón de reservar */}
        <section className="Perfil-cabecera">
            <img className="Perfil-img" src={avatarUrl} alt={nombre} />
            <div className="Perfil-datos">
                <h1 className="Perfil-nombre">{nombre}</h1>
                <p className="Perfil-info">{ubicacion} - {experienciaAnos} años de experiencia</p>
            </div>
            < Reservar cuidador={cuidador} />
        </section>
         <section className="Perfil-bloque">
                <h2>Datos</h2>
                <p><span className="Perfil-etiqueta">Edad:</span> {edad} años</p>
                <p><span className="Perfil-etiqueta">Animales que cuida:</span> {animalesQueAtiende.join(', ')}</p>
         </section>
        {/* Listamos solo los servicios activos del cuidador con su precio */}
        <section className="Perfil-bloque">
            <h2>Servicios</h2>
            <div className="Perfil-servicios">
                { activos.map( clave =>
                    <Servicio key={clave} nombre ={NOMBRES_SERVICIO[clave]} precio={obtenerPrecioServicio(preciosPorServicio, clave)} />
                )}
            </div>
        </section>
        {/* Carrusel con los comentarios de los usuarios que han contratado al cuidador */}
        <section className="Perfil-bloque">
            <h2>Comentarios</h2>
            <Comentarios cuidadorId={id} />
        </section>
       </main>
    )
}

const Servicio = ( { nombre, precio } ) => {

    return (
        <article className="Servicio">
            <span className="Servicio-nombre">{nombre}</span>
            <span className="Servicio-precio">{precio}€</span>
        </article>
    )
}