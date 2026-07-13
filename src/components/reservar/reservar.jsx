
import { useState, useRef, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../../context/auth-context'
import { obtenerPrecioServicio } from '../precios/precios'
import { NOMBRES_SERVICIO, CLAVES_SERVICIO, HORAS_RESERVA } from '../../const/servicios'
import './reservar.css'

/* Recibe el cuidador entero por props: botón que abre un modo para crear la reserva */
export const Reservar = ({ cuidador }) => {

    const { VITE_EXPRESS } = import.meta.env

    const { usuario } = useContext(AuthContext)

    const navigate = useNavigate()

    const formulario = useRef(null)

    const [ abierto, setAbierto ] = useState(null)

    /* Servicios que ofrece este cuidador: filtramos el catálogo fijo con sus servicios activos */
    const servicios = CLAVES_SERVICIO.filter( clave => cuidador.servicios[clave] )

    const [ servicio, setServicio ] = useState(servicios[0])

    const cambiarServicio = (e) => {
        setServicio(e.target.value)
    }

    const mascotas = abierto?.mascotas || []

    const abrir = async () => {

        const peticion = await fetch(`${VITE_EXPRESS}/perfiles/${usuario._id}`)
        const { data } = await peticion.json()
      
        setAbierto(data)
    }

    const cerrar = () => {
        setAbierto(null)
    }

    
    /* Paseo/peluquería: un día y una hora, guardería: un día con rango de horas y larga estancia rango de fechas */
    const mismoDia = servicio === 'paseador' || servicio === 'peluqueria'
    const esGuarderia = servicio === 'cuidadoDiario'

    const guardarReserva = async (e) => {
        e.preventDefault()

        const campos = formulario.current

        const datosForm = new FormData( campos )
        const marcadas = datosForm.getAll('mascotas')

        if (marcadas.length === 0) return
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

        const compartido = {
            fechaInicio,
            fechaFin,
            tipoServicio: servicio,
            estado: 'Pendiente',
            coste: obtenerPrecioServicio(cuidador.preciosPorServicio, servicio),
            cuidador: {
                cuidadorId: cuidador._id,
                nombre: cuidador.nombre,
                avatarUrl: cuidador.avatarUrl
            },
            usuario: {
                perfilId: usuario._id,
                nombre: abierto.nombre
            }
        }

       const listaDatos = marcadas.map(mascotaId => {
        const mascota = mascotas.find( ({ _id }) => _id === mascotaId )
          return {...compartido, 
          mascota: {
                    mascotaId: mascota._id,
                    nombre: mascota.nombre,
                    especie: mascota.especie,
                    fotoUrl: mascota.fotoUrl
                }
            }

       })
          
       for (const datos of listaDatos){

            const options = {
                method: 'POST',
                headers: { 
                    'Content-type': 'application/json' 
                },
                body: JSON.stringify(datos)
            }
            await fetch(`${VITE_EXPRESS}/reservas`, options)
        }

        cerrar()
        navigate('/mis-reservas')
    }

    return (
        <>
            <button className="Reservar-boton" type="button" onClick={abrir}>Reservar</button>
            {/* Como en el lightbox, el fondo siempre está renderizado y se muestra alternando la clase isVisible */}
            <div className={`Reservar-fondo ${ abierto ? `isVisible` : `` }`} onClick={cerrar}>
                    <form className="Reservar-modal" ref={formulario} onSubmit={guardarReserva} onClick={(e) => e.stopPropagation()}>
                        <h2>Reservar con {cuidador.nombre}</h2>
                        { mascotas.length === 0
                            ? <p>No hay mascotas. Añade una en Mi perfil antes de reservar.</p>
                            : <>
                                <div className="Reservar-campo">
                                  <span>Mascotas</span>
                                  <div className="Reservar-mascotas">
                                      { mascotas.map( ({ _id, nombre }) =>
                                        <label key={_id} className="Reservar-mascota">
                                          <input type="checkbox" name="mascotas" value={_id} />
                                          <span>{nombre}</span>
                                        </label>
                                        )}
                                    </div>
                                </div>
                                <label className="Reservar-campo">
                                    <span>Servicio</span>
                                    <select name="tipoServicio" defaultValue={servicio} onChange={cambiarServicio}>
                                        { servicios.map(clave =>
                                          <option key={clave} value={clave}>{NOMBRES_SERVICIO[clave]}</option>
                                        )}
                                    </select>
                                </label>
                                { mismoDia &&
                                    <div className="Reservar-fechas">
                                        <label className="Reservar-campo">
                                            <span>Día</span>
                                            <input type="date" name="dia" required />
                                        </label>
                                        <label className="Reservar-campo">
                                            <span>Hora</span>
                                            {/* Select con las horas de 15 en 15: solo existen las opciones válidas */}
                                            <select name="hora" defaultValue="" required>
                                                <option value="" disabled hidden>--:--</option>
                                                { HORAS_RESERVA.map( hora =>
                                                    <option key={hora} value={hora}>{hora}</option>
                                                )}
                                            </select>
                                        </label>
                                    </div>
                                }
                                { esGuarderia &&
                                    <>
                                        <label className="Reservar-campo">
                                            <span>Día</span>
                                            <input type="date" name="dia" required />
                                        </label>
                                        <div className="Reservar-fechas">
                                            <label className="Reservar-campo">
                                                <span>Hora de inicio</span>
                                                <select name="horaInicio" defaultValue="" required>
                                                    <option value="" disabled hidden>--:--</option>
                                                    { HORAS_RESERVA.map( hora =>
                                                        <option key={hora} value={hora}>{hora}</option>
                                                    )}
                                                </select>
                                            </label>
                                            <label className="Reservar-campo">
                                                <span>Hora de finalización</span>
                                                <select name="horaFin" defaultValue="" required>
                                                    <option value="" disabled hidden>--:--</option>
                                                    { HORAS_RESERVA.map( hora =>
                                                        <option key={hora} value={hora}>{hora}</option>
                                                    )}
                                                </select>
                                            </label>
                                        </div>
                                    </>
                                }
                                { !mismoDia && !esGuarderia &&
                                    <div className="Reservar-fechas">
                                        <label className="Reservar-campo">
                                            <span>Fecha inicio</span>
                                            <input type="date" name="fechaInicio" required />
                                        </label>
                                        <label className="Reservar-campo">
                                            <span>Fecha fin</span>
                                            <input type="date" name="fechaFin" required />
                                        </label>
                                    </div>
                                }
                                <div className="Reservar-acciones">
                                    <button className="Reservar-cancelar" type="button" onClick={cerrar}>Cancelar</button>
                                    <button className="Reservar-confirmar" type="submit">Confirmar reserva</button>
                                </div>
                            </>
                        }

                    </form>
            </div>
        </>
    )
}
