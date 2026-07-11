
import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Reservar } from '../../components/reservar/reservar'
import { obtenerPrecioServicio, obtenerPrecioPrimerServicio } from '../../components/precios/precios'
import { useCuidadores } from '../../hooks/use-cuidadores'
import { LISTA_ANIMALES } from '../../const/servicios'
import "./inicio.css"

export const Inicio = () => {

    const formulario = useRef( null )

    const { cuidadores, buscarCuidadores } = useCuidadores()

    const [ servicioFiltro, setServicioFiltro ] = useState('')
    const [ animalesFiltro, setAnimalesFiltro ] = useState([])

    /* Añade o quita el animal de la selección para poder marcar varios a la vez */
    const toggleAnimal = ( animal ) => {
        setAnimalesFiltro( prev =>
            prev.includes(animal)
                ? prev.filter( cada => cada !== animal )
                : [...prev, animal]
        )
    }

    const buscarCuidador = async ( e ) => {
        e.preventDefault()

        const { ubicacion, servicio } = formulario.current

        setServicioFiltro( servicio.value )

        await buscarCuidadores( ubicacion.value.trim(), servicio.value, animalesFiltro )
    }

    return(
     <>
        {/* En la sección hero agrupamos el título, el subtítulo y el buscador por ubicación y servicio */}
        <section className="Inicio">
            <h1 className="Inicio-h1">Encuentra el cuidador perfecto para ti</h1>
            <p className="Inicio-subtitulo">
                 El cuidado mas profesional para tu mascota cuando lo necesites.
            </p>
            <form className="Inicio-buscador" ref={formulario} onSubmit={buscarCuidador}>
                {/* aria-label da nombre accesible a los campos, que solo tienen placeholder */}
                <input type="text" name="ubicacion" placeholder="¿Donde buscas?" aria-label="Ubicación" />
                <select name="servicio" aria-label="Servicio">
                    <option value="">Servicio</option>
                    <option value="cuidadoDiario">Guardería</option>
                    <option value="largaEstancia">Larga estancia</option>
                    <option value="paseador">Paseador</option>
                    <option value="peluqueria">Peluquería</option>
                </select>
                <button className="Inicio-buscar" type="submit">Buscar cuidador</button>
                {/* Filtro de animales: se pueden seleccionar varios a la vez
                y el seleccionado se marca con la clase isActive como en las tabs */}
                <div className="Inicio-animales">
                    { LISTA_ANIMALES.map( animal =>
                        <button key={animal} type="button"
                            className={`Inicio-animal ${ animalesFiltro.includes(animal) ? `isActive` : `` }`}
                            onClick={ () => toggleAnimal(animal) }>{animal}</button>
                    )}
                </div>
            </form>
        </section>
        {/* En la sección de resultados listamos una tarjeta por cada cuidador encontrado */}
        <section className="Inicio-resultados">
            <h2>Conoce a nuestros profesionales</h2>
            { cuidadores.length === 0 &&
            <p>No hay cuidadores</p>
            }
            <div className="Inicio-lista">
                { cuidadores.map( cuidador =>
                    <Cuidador key={cuidador._id} cuidador={cuidador} servicioFiltro={servicioFiltro} />
                )}
            </div>
        </section>
    </>
    )
}

/* Tarjeta de un cuidador: foto, datos, etiquetas, precio y botón de reservar;
el cuidador llega agrupado en una prop porque el modal lo necesita entero */
const Cuidador = ( { cuidador, servicioFiltro } ) => {

    const { _id, nombre, avatarUrl, ubicacion, experienciaAnos,
        animalesQueAtiende, preciosPorServicio } = cuidador

    const precio = obtenerPrecioServicio( preciosPorServicio, servicioFiltro ) || obtenerPrecioPrimerServicio( preciosPorServicio )

    return (
        <article className="Cuidador">
            {/* lazy: las fotos de la lista se cargan al acercarse a pantalla */}
            <img src={avatarUrl} alt={nombre} className="Cuidador-img" loading="lazy" />
            <div className="Cuidador-info">
                <h3 className="Cuidador-nombre">{nombre}</h3>
                <p className="Cuidador-info">{ubicacion} - {experienciaAnos} años de experiencia</p>
                <div className="Cuidador-etiquetas">
                    { animalesQueAtiende && animalesQueAtiende.map( animal =>
                        <span key={animal} className="Cuidador-etiqueta">{animal}</span>
                    ) }
                </div>
                <Link to={`/cuidador/${ _id }`} className="Cuidador-link">Ver perfil</Link>
            </div>
            <div className="Cuidador-lateral">
                <div className="Cuidador-precio">{precio}€/sesión</div>
                <Reservar cuidador={ cuidador }/>
            </div>
        </article>
    )
}