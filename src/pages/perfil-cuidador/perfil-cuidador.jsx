
import { useState, useEffect, useRef, useContext } from 'react'
import { AuthContext } from '@context/auth-context'
import { obtenerPrecioServicio } from '@components/precios/precios'
import { leerFoto } from '@components/fotos/fotos'
import { NOMBRES_SERVICIO, CLAVES_SERVICIO, ahora } from '@const/servicios'
import { pedir } from '@components/peticiones/peticiones'
import './perfil-cuidador.css'

export const PerfilCuidador = () => {

    const { VITE_EXPRESS } = import.meta.env

    const { usuario } = useContext(AuthContext)

    const [ cuidador, setCuidador ] = useState( null )
    const [ reservas, setReservas ] = useState( [] )
    const [ editando, setEditando ] = useState( false )
    const [ pendientesAbierto, setPendientesAbierto ] = useState( false )
    const [ confirmadasAbierto, setConfirmadasAbierto ] = useState( false )
    /* Mensaje de error de la última petición que haya fallado */
    const [ error, setError ] = useState('')

    const togglePendientes = () => {
        setPendientesAbierto( prev => !prev )
    }

    const toggleConfirmadas = () => {
        setConfirmadasAbierto( prev => !prev )
    }

    const formulario = useRef( null )

    const getCuidador = async () => {

        try {
            const data = await pedir(`${ VITE_EXPRESS }/cuidadores/${ usuario._id }`)

            setCuidador( data )
        } catch (fallo) {
            setError( fallo.message )
        }
    }

    const getReservas = async () => {

        try {
            const data = await pedir(`${ VITE_EXPRESS }/reservas/cuidador/${ usuario._id }`)

            setReservas( data )
        } catch (fallo) {
            setError( fallo.message )
        }
    }

    /* Cada 15s se vuelven a pedir las reservas, así evitamos tener que depender de recargar para recibir las alertas*/
    useEffect(() => {
        getCuidador()
        getReservas()

        const recarga = setInterval(getReservas, 15000)

        return () => clearInterval(recarga)
    }, [])

    const guardarDatos = async ( e ) => {
        e.preventDefault()

        const{
            nombre, avatar, edad, ubicacion, experienciaAnos, animalesQueAtiende,
            servicio_cuidadoDiario, servicio_largaEstancia, servicio_paseador, servicio_peluqueria,
            precio_cuidadoDiario, precio_largaEstancia, precio_paseador, precio_peluqueria
        } = formulario.current

        const datos = {
            nombre: nombre.value,
            avatarUrl: await leerFoto(avatar, cuidador.avatarUrl),
            edad: edad.value,
            ubicacion: ubicacion.value,
            experienciaAnos: experienciaAnos.value,
            animalesQueAtiende: animalesQueAtiende.value.split(',').map(animal => animal.trim()).filter(animal => animal !== ''),
            servicios: {
                cuidadoDiario: servicio_cuidadoDiario.checked,
                largaEstancia: servicio_largaEstancia.checked,
                paseador: servicio_paseador.checked,
                peluqueria: servicio_peluqueria.checked
            },
            preciosPorServicio: {
                cuidadoDiario: precio_cuidadoDiario.value,
                largaEstancia: precio_largaEstancia.value,
                paseador: precio_paseador.value,
                peluqueria: precio_peluqueria.value
            }
        }

        const options = {
            method: 'PUT',
             headers: {
                 'Content-type': 'application/json' 
                },
            body: JSON.stringify( datos )
        }

        try {
            await pedir(`${VITE_EXPRESS}/cuidadores/${usuario._id}`, options)

            await getCuidador()
            setEditando( false )
        } catch (fallo) {
            setError( fallo.message )
        }
    }

        const aceptar = async ( _id ) => {
        
        const options = {
            method: 'PATCH',
            headers: {
                 'Content-type': 'application/json' 
                },
            body: JSON.stringify({ estado: 'Confirmada' })
        }

        try {
            await pedir(`${VITE_EXPRESS}/reservas/${ _id }`, options)

            getReservas()
        } catch (fallo) {
            setError( fallo.message )
        }
    }

    const rechazar = async ( _id ) => {
        const options = { 
            method: 'DELETE' 
        }

        try {
            await pedir(`${VITE_EXPRESS}/reservas/${ _id }`, options)

            getReservas()
        } catch (fallo) {
            setError( fallo.message )
        }
    }

    const devolverPendiente = async ( _id ) => {

        const options = {
            method: 'PATCH',
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify({ estado: 'Pendiente' })
        }

        try {
            await pedir(`${VITE_EXPRESS}/reservas/${ _id }`, options)

            getReservas()
        } catch (fallo) {
            setError( fallo.message )
        }
    }

    /* Guarda la conversación de la reserva con los mensajes que le pasen (uno nuevo o los ocultados) */
    const guardarMensajes = async ( _id, mensajes ) => {

        const options = {
            method: 'PATCH',
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify({ mensajes })
        }

        try {
            await pedir(`${VITE_EXPRESS}/reservas/${ _id }`, options)

            getReservas()
        } catch (fallo) {
            setError( fallo.message )
        }
    }


    /* Si la API falla antes de tener el cuidador mostramos el motivo */
    if (error && !cuidador) {
        return <p className="AppLayout-error">{error}</p>
    }

    if (!cuidador) {
        return <p className="Cargando">Cargando...</p>
    }

    /* Deconstruimos en el parámetro el campo de la reserva que usa cada filtro */
    const pendientes = reservas.filter( ({ estado }) => estado === 'Pendiente')

    const confirmadas = reservas.filter( ({ estado }) => estado === 'Confirmada')

    /* Reservas con algún mensaje que el cuidador no haya borrado de su lado */
    const conMensaje = reservas.filter( ({ mensajes }) => mensajes.some( ({ borradoPor }) => !borradoPor.includes('cuidador') ) )

    const servicios = CLAVES_SERVICIO
        .filter( clave => cuidador.servicios[clave] )
        .map( clave => (
            {
            clave,
            nombre: NOMBRES_SERVICIO[clave],
            precio: obtenerPrecioServicio(cuidador.preciosPorServicio, clave)
        }
    ))

    return (
        <>
        { error && <p className="AppLayout-error">{error}</p> }
        {/* Dividimos el panel en 2 columnas: lateral (perfil y datos editables) y principal (reservas) */}
        <div className="Panel-grid">
            <div className="Panel-lateral">
                <div className="Panel-bloque Panel-perfil">
                    <img className="Panel-img" src={cuidador.avatarUrl} alt={cuidador.nombre}/>
                    <h1 className="Panel-nombre">{cuidador.nombre}</h1>
                    <p className="Panel-info">{cuidador.experienciaAnos} años de experiencia</p>
                    <p className="Panel-miembro">Miembro desde {cuidador.miembroDesde}</p>
                </div>
                <div className="Panel-bloque">
                    <div className="Panel-cabecera">
                        <h2>Mis datos</h2>
                        { !editando &&
                        <button className="Panel-editar" type="button" onClick={ () => setEditando(true) }>Editar</button>
                        }
                    </div>
                    { editando
                    ? <form ref={formulario} onSubmit={guardarDatos} className="Panel-form">
                        <label className="Panel-campo">
                            <span>Nombre</span>
                            <input name="nombre" defaultValue={cuidador.nombre} />
                        </label>
                        {/* Si no se elige archivo se mantiene la foto actual */}
                        <label className="Panel-campo">
                            <span>Foto</span>
                            <input name="avatar" type="file" accept="image/*" />
                        </label>
                        <label className="Panel-campo">
                            <span>Edad</span>
                            <input name="edad" type="number" defaultValue={cuidador.edad} />
                        </label>
                        <label className="Panel-campo">
                            <span>Ubicación</span>
                            <input name="ubicacion" defaultValue={cuidador.ubicacion} />
                        </label>
                        <label className="Panel-campo">
                            <span>Experiencia</span>
                            <input name="experienciaAnos" type="number" defaultValue={cuidador.experienciaAnos} />
                        </label>
                        <label className="Panel-campo">
                            <span>Animales que cuida (separados por coma)</span>
                            <input name="animalesQueAtiende" defaultValue={cuidador.animalesQueAtiende.join(', ')} />
                        </label>
                        <span className="Panel-subtitulo">Servicios y precios</span>
                        { CLAVES_SERVICIO.map( clave =>
                            <div key={clave} className="Panel-servicioEdit">
                                <input type="checkbox" name={`servicio_${clave}`} defaultChecked={cuidador.servicios[clave]} />
                                <span className="Panel-servicioNombre">{NOMBRES_SERVICIO[clave]}</span>
                                <span className="Panel-precioCampo">
                                    <input type="number" className="Panel-precio" name={`precio_${clave}`} defaultValue={cuidador.preciosPorServicio[clave]} />
                                    <span className="Panel-euro">€</span>
                                </span>
                            </div>
                        )}
                        <div className="Panel-acciones">
                            <button className="Panel-cancelar" type="button" onClick={ () => setEditando(false) }>Cancelar</button>
                            <button className="Panel-guardar" type="submit">Guardar</button>
                        </div>
                    </form>
                    : <>
                        <p>
                            <span className="Panel-dato">Edad:</span>
                            {cuidador.edad} años
                        </p>
                         <p>
                            <span className="Panel-dato">Ubicacion:</span>
                            {cuidador.ubicacion}
                        </p>
                        <p>
                            <span className="Panel-dato">Animales que cuida:</span>
                        </p>
                        <div className="Panel-animales">
                            { cuidador.animalesQueAtiende.map( animal =>
                                <span key={animal} className="Panel-animal">{animal}</span>
                            )}
                        </div>
                        <h3>Servicios</h3>
                        <div className="Panel-servicios">
                            { servicios.map( servicio =>
                                <Servicio key={servicio.clave} {...servicio} />
                            )}
                        </div>
                    </>
                    }
                </div>
            </div>
            <section className="Panel-principal">
                {/* Cada bloque es un desplegable: la flecha alterna el estado
                y el acordeón se muestra con la clase isActive */}
                <div className="Panel-bloque">
                    <div className="Panel-cabecera">
                        {/* El contador avisa de solicitudes nuevas */}
                        <h2>
                            Solicitudes pendientes
                            { pendientes.length > 0 &&
                                <span className="Panel-contador">+{pendientes.length}</span>
                            }
                        </h2>
                        <button className="Panel-desplegar" type="button" onClick={togglePendientes} aria-label="Desplegar solicitudes pendientes">
                            <svg className={`Panel-flecha ${ pendientesAbierto ? `isActive` : `` }`} viewBox="0 0 24 24">
                                <use href="#down-arrow" />
                            </svg>
                        </button>
                    </div>
                    <div className={`Panel-acordeon ${ pendientesAbierto ? `isActive` : `` }`}>
                        { pendientes.length === 0
                        ? <p>No tienes solicitudes pendientes.</p>
                        : <div className="Panel-solicitudes">
                            { pendientes.map( reserva =>
                                <Solicitud key={reserva._id} {...reserva} aceptar={aceptar} rechazar={rechazar} />
                            )}
                        </div>
                        }
                    </div>
                </div>
                <div className="Panel-bloque">
                    <div className="Panel-cabecera">
                        <h2>Reservas confirmadas</h2>
                        <button className="Panel-desplegar" type="button" onClick={toggleConfirmadas} aria-label="Desplegar reservas confirmadas">
                            <svg className={`Panel-flecha ${ confirmadasAbierto ? `isActive` : `` }`} viewBox="0 0 24 24">
                                <use href="#down-arrow" />
                            </svg>
                        </button>
                    </div>
                    <div className={`Panel-acordeon ${ confirmadasAbierto ? `isActive` : `` }`}>
                        { confirmadas.length === 0
                        ? <p>No tienes reservas confirmadas.</p>
                        : <ul className="Panel-confirmadas">
                            { confirmadas.map( reserva =>
                                <Confirmada key={reserva._id} {...reserva} cancelar={devolverPendiente} />
                            )}
                        </ul>
                        }
                    </div>
                </div>
                {/* Mensajes recibidos de los usuarios sobre sus reservas */}
                <div className="Panel-bloque">
                    <h2>Mensajes</h2>
                    { conMensaje.length === 0
                    ? <p>No tienes mensajes.</p>
                    : <div className="Panel-mensajes">
                        { conMensaje.map( reserva =>
                            <Mensaje key={reserva._id} {...reserva} guardarMensajes={guardarMensajes} />
                        )}
                    </div>
                    }
                </div>
            </section>
        </div>
        </>
    )
        
}

const Servicio = ( { nombre, precio } ) => {

    return <span className="Panel-etiqueta">{nombre} {precio}€</span>
}

/* Conversación de una reserva vista por el cuidador: se puede responder o eliminar de su lado,
el cuadro de respuesta se muestra con la clase isActive */
const Mensaje = ( { _id, usuario, mascota, mensajes, guardarMensajes } ) => {

    const [ respondiendo, setRespondiendo ] = useState(false)
    const formulario = useRef(null)

    /* Solo los mensajes que el cuidador no ha borrado de su lado */
    const visibles = mensajes.filter( ({ borradoPor }) => !borradoPor.includes('cuidador') )

    const toggleRespondiendo = () => {
        setRespondiendo( prev => !prev )
    }

    const enviar = async ( e ) => {
        e.preventDefault()

        const { respuesta } = formulario.current

        if (!respuesta.value.trim()) return

        const nuevo = { autor: 'cuidador', texto: respuesta.value.trim(), fecha: ahora(), borradoPor: [] }

        await guardarMensajes(_id, [...mensajes, nuevo])

        formulario.current.reset()
        setRespondiendo(false)
    }

    /* Oculta la conversación solo para el cuidador: el usuario sigue viéndola */
    const eliminar = async () => {
        const ocultos = mensajes.map( mensaje => ({ ...mensaje, borradoPor: [...mensaje.borradoPor, 'cuidador'] }) )

        await guardarMensajes(_id, ocultos)
    }

    return(
        <div className="Mensaje">
            <p className="Mensaje-autor">{usuario.nombre} - reserva de {mascota.nombre}</p>
            {/* Un párrafo por mensaje, en orden: los del usuario en gris y los otros en verde */}
            { visibles.map( ({ _id: idMensaje, autor, texto, fecha }) =>
                <p key={idMensaje} className={ autor === 'usuario' ? 'Mensaje-texto' : 'Mensaje-respuesta' }>
                    <span className="Mensaje-autor">{ autor === 'usuario' ? usuario.nombre : 'Tú' } · {fecha}</span> {texto}
                </p>
            )}
            <div className="Mensaje-acciones">
                <button className="Mensaje-responder" type="button" onClick={toggleRespondiendo}>Responder</button>
                <button className="Mensaje-eliminar" type="button" onClick={eliminar}>Eliminar</button>
            </div>
            <form className={`Mensaje-form ${ respondiendo ? `isActive` : `` }`} ref={formulario} onSubmit={enviar}>
                <input name="respuesta" placeholder="Escribe tu respuesta" />
                <button className="Mensaje-enviar" type="submit">Enviar</button>
            </form>
        </div>
    )
}

/* Solicitud pendiente */
const Solicitud = ( { _id, mascota, usuario, tipoServicio, fechaInicio, fechaFin, aceptar, rechazar } ) => {

    return(
        <article className="Solicitud">
            {/* Si la mascota no tiene foto mostramos la imagen por defecto */}
            <img src={mascota.fotoUrl || '/mascota-default.svg'} alt={mascota.nombre} className="Solicitud-img" loading="lazy" />
            <div className="Solicitud-info">
                <h4>{mascota.nombre} ({mascota.especie})</h4>
                <p>Cliente: {usuario.nombre}</p>
                <p>{NOMBRES_SERVICIO[tipoServicio] || tipoServicio } / {fechaInicio} - {fechaFin}</p>
            </div>
            <div className="Solicitud-acciones">
                <button className="Solicitud-rechazar" type="button" onClick={ () => rechazar( _id )}>Rechazar</button>
                <button className="Solicitud-aceptar" type="button" onClick={ () => aceptar( _id )}>Aceptar</button>
            </div>
        </article>
    )
}

/* Reserva confirmada */
const Confirmada = ( { _id, mascota, usuario, tipoServicio, fechaInicio, fechaFin, cancelar } ) => {

    return (
        <li className="Confirmada">
            <span className="Confirmada-cliente">
               <span className="Confirmada-nombre">{mascota.nombre}</span>
               - {usuario.nombre}
            </span>
            <span>{NOMBRES_SERVICIO[tipoServicio] || tipoServicio}</span>
            <span>{fechaInicio} / {fechaFin}</span>
            <span className="Confirmada-estado">Confirmada</span>
            <button className="Confirmada-cancelar" type="button" onClick={() => cancelar( _id )}>Cancelar</button>
        </li>
    )
}


