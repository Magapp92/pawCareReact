
import { useState, useEffect } from 'react'
import { NOMBRES_SERVICIO } from '../../const/servicios'
import './comentarios.css'

/* Comentarios falsos de base para que el carrusel siempre tenga contenido */
const comentariosFalsos = [
    { _id: 'falso-1', texto: 'Cuidó de mi perro como si fuera suyo, repetiremos seguro.', usuario: 'Lucía M.', servicio: 'Guardería de día' },
    { _id: 'falso-2', texto: 'Muy puntual y cariñoso con los animales, mi gata volvió feliz.', usuario: 'Carlos R.', servicio: 'Larga estancia' },
    { _id: 'falso-3', texto: 'Los paseos diarios le vinieron genial a Max, todo perfecto.', usuario: 'Marta G.', servicio: 'Paseo' },
    { _id: 'falso-4', texto: 'Dejó a mi bulldog precioso después de la peluquería.', usuario: 'Javier L.', servicio: 'Peluquería' },
    { _id: 'falso-5', texto: 'Nos mandó fotos todos los días, se nota que le encantan los animales.', usuario: 'Ana P.', servicio: 'Guardería de día' }
]

/* Recibe el id del cuidador por props: carrusel con los comentarios de sus reservas */
export const Comentarios = ( { cuidadorId } ) => {

    const { VITE_EXPRESS } = import.meta.env

    const [ comentarios, setComentarios ] = useState(comentariosFalsos)
    
    const [ actual, setActual ] = useState(0)

    const getComentarios = async () => {

        const peticion = await fetch(`${VITE_EXPRESS}/reservas/cuidador/${cuidadorId}`)
        const { data } = await peticion.json()

        /* A los comentarios falsos les añadimos los reales de las reservas comentadas */
        const comentariosReales = data
            .filter( ({ comentario }) => comentario )
            .map( ({ _id, comentario, usuario, tipoServicio }) => ({
                _id,
                texto: comentario,
                usuario: usuario.nombre,
                servicio: NOMBRES_SERVICIO[tipoServicio] || tipoServicio
            }))

        setComentarios([...comentariosFalsos, ...comentariosReales])
    }

    useEffect(() => {
        getComentarios()
    }, [])

    const aumentarComentario = () => {
        setActual( prev => prev >= comentarios.length - 1 ? 0 : prev + 1 )
    }

    const disminuirComentario = () => {
        setActual( prev => prev <= 0 ? comentarios.length - 1 : prev - 1 )
    }

    const cambiarComentario = (nuevo) => {
        setActual(nuevo)
    }

    /* Avance automático en bucle: al llegar al último vuelve al primero */
    useEffect(() => {
        const automatico = setInterval(aumentarComentario, 4000)

        return () => clearInterval(automatico)
    }, [actual, comentarios.length])

    return(
        <div className="Comentarios">
            {/* Las flechas van sobre la ventana, centradas a cada lado del comentario */}
            <div className="Comentarios-ventana">
                {/* El translate desplaza la fila -100% por cada comentario avanzado */}
                <div className="Comentarios-wrapper" style={{ translate: `-${ actual * 100 }% 0` }}>
                    {
                        comentarios.map( comentario =>
                            <Comentario key={comentario._id} {...comentario} />
                        )
                    }
                </div>
                <button onClick={disminuirComentario} className="Comentarios-flecha Comentarios-flecha--prev" type="button" aria-label="Comentario anterior">
                    <svg className="Comentarios-svgFlecha" viewBox="0 0 24 24">
                        <use href="#left-arrow" />
                    </svg>
                </button>
                <button onClick={aumentarComentario} className="Comentarios-flecha Comentarios-flecha--next" type="button" aria-label="Comentario siguiente">
                    <svg className="Comentarios-svgFlecha" viewBox="0 0 24 24">
                        <use href="#right-arrow" />
                    </svg>
                </button>
            </div>

            <ul className="Comentarios-ul">
                {comentarios.map( ({ _id }, indice) =>
                    <Dot key={_id} indice={indice} activo={indice === actual} cambiarComentario={cambiarComentario} />
                )}
            </ul>
        </div>
    )
}

const Comentario = ( { texto, usuario } ) => {

    return(
        <article className="Comentario">
            <p className="Comentario-texto">“{texto}”</p>
            <p className="Comentario-usuario">{usuario}</p>
        </article>
    )
}

/* Cada punto recibe su índice: saltar de comentario es cambiar el actual */
const Dot = ( { indice, activo, cambiarComentario } ) => {

    return(
        <li className="Comentarios-li">
            <button onClick={ ()=> cambiarComentario(indice) } className={ activo ? 'Comentarios-dot Comentarios-dot--activo' : 'Comentarios-dot' } type="button">
                Ver comentario {indice + 1}
            </button>
        </li>
    )
}
