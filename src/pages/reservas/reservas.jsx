
import { useState, useEffect, useRef, useContext } from 'react'
import { AuthContext } from '../../context/auth-context'
import { NOMBRES_SERVICIO, HORAS_RESERVA } from '../../const/servicios'
import './reservas.css'

export const Reservas = () => {

    const { VITE_EXPRESS } = import.meta.env

    const { usuario } = useContext(AuthContext)

    const [ reservas, setReservas ] = useState([])
    const [ cuidadores, setCuidadores ] = useState([])

    const getReservas = async () => {

        const peticion = await fetch(`${VITE_EXPRESS}/reservas/usuario/${usuario._id}`)
        const { data } = await peticion.json()

        setReservas(data)
    }

    const getCuidadores = async () => {

        const peticion = await fetch(`${VITE_EXPRESS}/cuidadores`)
        const { data } = await peticion.json()

        setCuidadores(data)
    }

    useEffect(() => {
        getReservas()
        getCuidadores()
    }, [])

    const editarReserva = async ( _id, datos ) => {

        const options = {
            method: 'PATCH',
            headers: { 
                'Content-type': 'application/json' 
            },
            body: JSON.stringify(datos)
        }
        await fetch(`${VITE_EXPRESS}/reservas/${ _id }`, options)

        await getReservas()
    }

    const cancelarReserva = async ( _id ) => {

        const options = { 
            method: 'DELETE' 
        }
        await fetch(`${VITE_EXPRESS}/reservas/${ _id }`, options)

        getReservas()
    }

        return (
        <main className="Reservas">
            <h1 className="Reservas-titulo">Mis reservas</h1>
            {/* Mostramos una tarjeta por reserva; pasamos el cuidador actual para mostrar sus datos actualizados */}
            { reservas.length === 0 && <p>Aún no tienes reservas.</p> }
            <div className="Reservas-lista">
                { reservas.map( reserva =>
                    <Reserva key={reserva._id} {...reserva}
                        cuidadorActual={ cuidadores.find( ({ _id }) => _id === reserva.cuidador.cuidadorId ) }
                        editarReserva={ editarReserva }
                        cancelarReserva={ cancelarReserva } />
                ) }
            </div>
        </main>
    )
}
/* Tarjeta de una reserva: en modo vista muestra los datos y en modo edición un formulario
para cambiar el servicio y las fechas */
const Reserva = ( { _id, cuidador, cuidadorActual, mascota, fechaInicio, fechaFin, tipoServicio,
    estado, coste, comentario, mensaje, respuesta, editarReserva, cancelarReserva } ) => {

    const { VITE_EXPRESS } = import.meta.env

    const nombreCuidador = cuidadorActual?.nombre || cuidador.nombre
    const fotoCuidador = cuidadorActual?.avatarUrl || cuidador.avatarUrl

    const [ editando, setEditando ] = useState(null)
    const [ servicio, setServicio ] = useState(null)
    const [ opinando, setOpinando ] = useState(false)
    const [ enviandoMensaje, setEnviandoMensaje ] = useState(false)
    const [ conversacionAbierta, setConversacionAbierta ] = useState(false)
    const formulario = useRef(null)
    const formularioComentario = useRef(null)
    const formularioMensaje = useRef(null)

    const toggleOpinando = () => {
        setOpinando( prev => !prev )
    }

    const toggleEnviandoMensaje = () => {
        setEnviandoMensaje( prev => !prev )
    }

    const toggleConversacion = () => {
        setConversacionAbierta( prev => !prev )
    }

    /* Borra la conversación con el cuidador vaciando sus campos */
    const borrarConversacion = async () => {
        await editarReserva(_id, { mensaje: '', respuesta: '' })
    }

    /* Envía una pregunta o sugerencia al cuidador de la reserva */
    const contestarMensaje = async ( e ) => {
        e.preventDefault()

        const { mensaje } = formularioMensaje.current

        await editarReserva(_id, { mensaje: mensaje.value })

        setEnviandoMensaje(false)
    }

    /* Guarda el comentario del usuario sobre la reserva */
    const comentar = async ( e ) => {
        e.preventDefault()

        const { comentario } = formularioComentario.current

        await editarReserva(_id, { comentario: comentario.value })

        setOpinando(false)
    }

    const cambiarServicio = ( e ) => {
        setServicio(e.target.value)
    }

    const empezarEdicion = async () => {

        const peticion = await fetch(`${VITE_EXPRESS}/reservas/${_id}`)
        const { data } = await peticion.json()

        setServicio(data.tipoServicio)
        setEditando(data)
    }

    /* Paseo/peluquería: un día y una hora · guardería: un día con rango de horas · larga estancia: rango de fechas */
    const mismoDia = servicio === 'paseador' || servicio === 'peluqueria'
    const esGuarderia = servicio === 'cuidadoDiario'

    const guardar = async ( e ) => {
        e.preventDefault()

        /* Los campos de fecha son condicionales según el servicio */
        const campos = formulario.current

        let fechaInicio
        let fechaFin

        if (mismoDia) {
            fechaInicio = fechaFin = `${campos.dia.value} ${campos.hora.value}`
        } else if (esGuarderia) {
            fechaInicio = `${campos.dia.value} ${campos.horaInicio.value}`
            fechaFin = `${campos.dia.value} ${campos.horaFin.value}`
        } else {
            fechaInicio = campos.fechaInicio.value
            fechaFin = campos.fechaFin.value
        }

        const datos = {
            fechaInicio,
            fechaFin,
            tipoServicio: campos.tipoServicio.value
        }

        /* Si cambia la fecha o la hora la reserva vuelve a Pendiente
        para que el cuidador la confirme o rechace de nuevo */
        if (fechaInicio !== editando.fechaInicio || fechaFin !== editando.fechaFin) {
            datos.estado = 'Pendiente'
        }

        await editarReserva(_id, datos)

        setEditando(null)
    }
    if (editando) {
        
        return(
             <form className="Reserva Reserva--edit" ref={formulario} onSubmit={guardar}>
                <h3>Editar reserva con {nombreCuidador}</h3>
                {/* Si la reserva ya está confirmada el servicio no se puede cambiar, solo la fecha y la hora */}
                <label className="Reserva-campo">
                    <span>Servicio</span>
                    {/* El estado solo escucha el cambio para repintar los campos de fecha */}
                    <select name="tipoServicio" defaultValue={servicio} onChange={cambiarServicio} disabled={editando.estado === 'Confirmada'}>
                        <option value="cuidadoDiario">Guardería de día</option>
                        <option value="largaEstancia">Larga estancia</option>
                        <option value="paseador">Paseo</option>
                        <option value="peluqueria">Peluquería</option>
                    </select>
                </label>
                { mismoDia &&
                    <div className="Reserva-fechas">
                        <label className="Reserva-campo">
                            <span>Día</span>
                            <input type="date" name="dia" defaultValue={editando.fechaInicio.split(' ')[0]} required />
                        </label>
                        <label className="Reserva-campo">
                            <span>Hora</span>
                            {/* Select con las horas de 15 en 15: solo existen las opciones válidas */}
                            <select name="hora" defaultValue={editando.fechaInicio.split(' ')[1]} required>
                                { HORAS_RESERVA.map( hora =>
                                    <option key={hora} value={hora}>{hora}</option>
                                )}
                            </select>
                        </label>
                    </div>
                }
                { esGuarderia &&
                    <>
                        <label className="Reserva-campo">
                            <span>Día</span>
                            <input type="date" name="dia" defaultValue={editando.fechaInicio.split(' ')[0]} required />
                        </label>
                        <div className="Reserva-fechas">
                            <label className="Reserva-campo">
                                <span>Hora de inicio</span>
                                <select name="horaInicio" defaultValue={editando.fechaInicio.split(' ')[1]} required>
                                    { HORAS_RESERVA.map( hora =>
                                        <option key={hora} value={hora}>{hora}</option>
                                    )}
                                </select>
                            </label>
                            <label className="Reserva-campo">
                                <span>Hora de finalización</span>
                                <select name="horaFin" defaultValue={editando.fechaFin.split(' ')[1]} required>
                                    { HORAS_RESERVA.map( hora =>
                                        <option key={hora} value={hora}>{hora}</option>
                                    )}
                                </select>
                            </label>
                        </div>
                    </>
                }
                { !mismoDia && !esGuarderia &&
                    <div className="Reserva-fechas">
                        <label className="Reserva-campo">
                            <span>Fecha inicio</span>
                            <input type="date" name="fechaInicio" defaultValue={editando.fechaInicio.split(' ')[0]} />
                        </label>
                        <label className="Reserva-campo">
                            <span>Fecha fin</span>
                            <input type="date" name="fechaFin" defaultValue={editando.fechaFin.split(' ')[0]} />
                        </label>
                    </div>
                }
                <div className="Reserva-acciones">
                    <button className="Reserva-cancelar" type="button" onClick={() => setEditando(false)}>Cancelar</button>
                    <button className="Reserva-guardar" type="submit">Guardar</button>
                </div>
            </form>
        )
    }
    return (
        <article className="Reserva">
            <div className="Reserva-info">
                <div className="Reserva-cabecera">
                    <img className="Reserva-foto" src={fotoCuidador} alt={nombreCuidador} />
                    <h3 className="Reserva-cuidador">{nombreCuidador}</h3>
                </div>
                <p className="Reserva-dato">Mascota: {mascota.nombre}</p>
                <p className="Reserva-dato">Fechas: {fechaInicio} - {fechaFin}</p>
                <p className="Reserva-dato">Servicio: {NOMBRES_SERVICIO[tipoServicio] || tipoServicio}</p>
                <span className="Reserva-estado">{estado}</span>
                {/* Solo se puede opinar sobre reservas confirmadas: el botón alterna el estado
                y el recuadro se muestra con la clase isActive */}
                { estado === 'Confirmada' &&
                    <>
                        <div className="Reserva-interacciones">
                            <button className="Reserva-opinar" type="button" onClick={toggleOpinando}>Agregar opinión</button>
                            <button className="Reserva-opinar" type="button" onClick={toggleEnviandoMensaje}>Enviar mensaje</button>
                        </div>
                        <form className={`Reserva-comentario ${ opinando ? `isActive` : `` }`} ref={formularioComentario} onSubmit={comentar}>
                            <input name="comentario" defaultValue={comentario} placeholder="Escribe un comentario sobre el servicio" />
                            <button className="Reserva-comentar" type="submit">Comentar</button>
                        </form>
                        <form className={`Reserva-comentario ${ enviandoMensaje ? `isActive` : `` }`} ref={formularioMensaje} onSubmit={contestarMensaje}>
                            <input name="mensaje" defaultValue={mensaje} placeholder="Escribe una pregunta o sugerencia al cuidador" />
                            <button className="Reserva-comentar" type="submit">Enviar</button>
                        </form>
                        {/* Cabecera del desplegable de la conversación: la flecha alterna el estado */}
                        { mensaje &&
                            <div className="Reserva-conversacionCabecera">
                                <span>Conversación</span>
                                {/* El +1 avisa de la respuesta del cuidador sin abrir el desplegable */}
                                { respuesta &&
                                    <span className="Reserva-contador">+1</span>
                                }
                                <button className="Reserva-desplegar" type="button" onClick={toggleConversacion} aria-label="Desplegar conversación">
                                    <svg className={`Reserva-flecha ${ conversacionAbierta ? `isActive` : `` }`} viewBox="0 0 24 24">
                                        <use href="#down-arrow" />
                                    </svg>
                                </button>
                            </div>
                        }
                    </>
                }
            </div>

            <div className="Reserva-lado">
                <p className="Reserva-coste">{coste}€</p>
                <button className="Reserva-editar" type="button" onClick={empezarEdicion}>Editar</button>
                <button className="Reserva-cancelarReserva" type="button" onClick={() => cancelarReserva(_id)}>Cancelar</button>
            </div>
            {/* El desplegable ocupa una fila entera del grid debajo de la info y el lado,
            así al abrirse no desplaza el precio ni los botones */}
            { estado === 'Confirmada' && mensaje &&
                <div className={`Reserva-conversacion ${ conversacionAbierta ? `isActive` : `` }`}>
                    <p className="Reserva-mensajeTexto">“{mensaje}”</p>
                    <p className="Reserva-mensajeAutor">Tú - reserva de {mascota.nombre}</p>
                    { respuesta && <p className="Reserva-respuesta">Respuesta de {nombreCuidador}: {respuesta}</p> }
                    <button className="Reserva-borrarConversacion" type="button" onClick={borrarConversacion}>Eliminar</button>
                </div>
            }
        </article>
    )

}