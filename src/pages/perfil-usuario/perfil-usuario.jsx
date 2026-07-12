
import { useState, useEffect,useRef, useContext } from 'react'
import { Link } from 'react-router-dom'
import { AuthContext } from '../../context/auth-context'
import { leerFoto } from '../../components/fotos/fotos'
import { NOMBRES_SERVICIO } from '../../const/servicios'
import "./perfil-usuario.css"

export const PerfilUsuario = () => {

    const { VITE_EXPRESS } = import.meta.env
    const { usuario } = useContext(AuthContext)

    const [ perfil, setPerfil ] = useState(null)
    const [ reservas, setReservas ] = useState([])
    const [ cuidadores, setCuidadores ] = useState([])
    const [ editandoDatos, setEditandoDatos ] = useState(false)
    const [ anadiendo, setAnadiendo ] = useState(false)

    const formularioDatos = useRef(null)
    const formularioMascota = useRef(null)

    const getPerfil = async () => {
        const peticion = await fetch(`${VITE_EXPRESS}/perfiles/${usuario._id}`)
        const { data } = await peticion.json()

        setPerfil( data )
    }

    const getReservas = async () => {
        const peticion = await fetch(`${VITE_EXPRESS}/reservas/usuario/${usuario._id}`)
        const { data } = await peticion.json()

        setReservas( data )
    }

    const getCuidadores = async () => {
        const peticion = await fetch(`${VITE_EXPRESS}/cuidadores`)
        const { data } = await peticion.json()

        setCuidadores( data )
    }

    useEffect(() => {
        getPerfil()
        getReservas()
        getCuidadores()
    }, [])

    const guardarDatos = async ( e ) => {
        e.preventDefault()

        const { nombre, telefono, direccion, avatar } = formularioDatos.current

        const datos = {
            nombre: nombre.value,
            telefono: telefono.value,
            direccion: direccion.value,
            avatarUrl: await leerFoto(avatar, perfil.avatarUrl)
        }

        const options = {
            method: 'PATCH',
            headers: { 
                'Content-type': 'application/json' 
            },
            body: JSON.stringify( datos )
        }
        await fetch(`${VITE_EXPRESS}/perfiles/${usuario._id}`, options)

        await getPerfil()
        setEditandoDatos(false)
    }

    const guardarMascota = async ( e ) => {
        e.preventDefault()

        const { nombre, raza, especie, edadMeses, foto, vacunada } = formularioMascota.current

        const datos = {
            nombre: nombre.value,
            raza: raza.value,
            especie: especie.value,
            edadMeses: edadMeses.value,
            vacunada: vacunada.checked,
            fotoUrl: await leerFoto(foto)
        }

        const options = {
            method: 'POST',
            headers: { 
                'Content-type': 'application/json' 
            },
            body: JSON.stringify( datos )
        }

        await fetch(`${VITE_EXPRESS}/perfiles/${usuario._id}/mascotas`, options)

        await getPerfil()
        setAnadiendo(false)
    }

    const editarMascota = async (_id, datos) => {

        const options = {
            method: 'PATCH',
            headers: { 
                'Content-type': 'application/json' 
            },
            body: JSON.stringify( datos )
        }

        await fetch(`${VITE_EXPRESS}/perfiles/${usuario._id}/mascotas/${_id}`, options)

        await getPerfil()
    }

    const eliminarMascota = async (_id) => {
        const options = { 
            method: 'DELETE' 
        }
        await fetch(`${VITE_EXPRESS}/perfiles/${usuario._id}/mascotas/${_id}`, options)

        getPerfil()
    }

    if (!perfil) {
        return <p className="MiPerfil-cargando">Cargando…</p>
    }

    /* Dividimos la página en 2 columnas: datos y últimas reservas a la izquierda, mascotas a la derecha */
    return(
        <main className="MiPerfil">
            <h1 className="MiPerfil-titulo">Mi perfil</h1>
            <p className="MiPerfil-subtitulo">Gestiona tu información personal, tus mascotas y tus reservas.</p>
            <div className="MiPerfil-grid">
                <div className="MiPerfil-columna">
                    <section className="MiPerfil-wrapper">
                        <div className="MiPerfil-cabecera">
                            <h2>Mis datos</h2>
                            { !editandoDatos &&
                              <button className="MiPerfil-editar" type="button" onClick={ () => setEditandoDatos(true) }>Editar</button>
                            }
                        </div>
                        { editandoDatos
                        ? <form ref={formularioDatos} onSubmit={guardarDatos}>
                            {/* Si no se elige archivo se mantiene la foto actual */}
                            <label className="MiPerfil-campo">
                                <span>Foto</span>
                                <input name="avatar" type="file" accept="image/*" />
                            </label>
                            <label className="MiPerfil-campo">
                                <span>Nombre completo</span>
                                <input name="nombre" defaultValue={perfil.nombre} />
                            </label>
                            <label className="MiPerfil-campo">
                                <span>Teléfono de contacto</span>
                                <input name="telefono" defaultValue={perfil.telefono} />
                            </label>
                            <label className="MiPerfil-campo">
                                <span>Dirección</span>
                                <input name="direccion" defaultValue={perfil.direccion} />
                            </label>
                            <div className="MiPerfil-acciones">
                                <button className="MiPerfil-cancelar" type="button" onClick={() => setEditandoDatos(false)}>Cancelar</button>
                                    <button className="MiPerfil-guardar" type="submit">Guardar cambios</button>
                            </div>
                        </form>
                        : <div className="MiPerfil-datos">
                                {/* La foto a la izquierda y la información a su derecha */}
                                <img className="MiPerfil-avatar" src={perfil.avatarUrl} alt={perfil.nombre} />
                                <div className="MiPerfil-textos">
                                    <p className="MiPerfil-nombre">{perfil.nombre}</p>
                                    <p>{perfil.telefono}</p>
                                    <p>{perfil.direccion}</p>
                                </div>
                           </div>
                        }
                    </section>
                     <section className="MiPerfil-bloque">
                        <h2>Últimas reservas</h2>
                        { reservas.length === 0
                            ? <p>No tienes reservas todavía.</p>
                            : <ul className="MiPerfil-reservas">
                                { reservas.map(reserva => <ReservaResumen key={reserva._id} {...reserva}
                                  cuidadorActual={ cuidadores.find( ({ _id }) => _id === reserva.cuidador.cuidadorId ) } />
                                )}
                            </ul>
                        }
                        <Link className="MiPerfil-irReservas" to="/mis-reservas">Ir a mis reservas →</Link>
                    </section>
                </div>
                <section className="MiPerfil-bloque">
                    <div className="MiPerfil-cabecera">
                        <h2>Mis mascotas</h2>
                        <button className="MiPerfil-anadir" type="button" onClick={() => setAnadiendo(true)}> Añadir mascota </button>
                    </div>
                    <div className="MiPerfil-mascotas">
                        { perfil.mascotas && perfil.mascotas.map( mascota =>
                            <Mascota key={mascota._id} {...mascota} editarMascota={editarMascota} eliminarMascota={eliminarMascota} />
                        )}
                        { anadiendo &&
                            <form className="Mascota Mascota--form" ref={formularioMascota} onSubmit={guardarMascota}>
                                <input name="nombre" placeholder="Nombre" required />
                                <input name="raza" placeholder="Raza" />
                                <select name="especie">
                                    <option value="perro">Perro</option>
                                    <option value="gato">Gato</option>
                                </select>
                                <label className="Mascota-campo">
                                    <span>Edad (meses)</span>
                                    <input name="edadMeses" type="number" />
                                </label>
                                <label className="Mascota-campo">
                                    <span>Foto</span>
                                    <input name="foto" type="file" accept="image/*" />
                                </label>
                                <label className="Mascota-check">
                                    <input name="vacunada" type="checkbox" />
                                    <span>Vacunado/a</span>
                                </label>
                                <div className="Mascota-acciones">
                                    <button className="Mascota-cancelar" type="button" onClick={() => setAnadiendo(false)}>Cancelar</button>
                                    <button className="Mascota-guardar" type="submit"> Guardar </button>
                                </div>
                            </form>
                        }
                    </div>
                </section>
            </div>
        </main>
    )
}

const ReservaResumen = ( { cuidador, cuidadorActual, tipoServicio, fechaInicio, fechaFin, estado } ) => {

    const nombreCuidador = cuidadorActual?.nombre || cuidador.nombre

    return (
        <li className="MiPerfil-reserva">
            {/* Nombre, debajo el servicio y debajo las fechas y horas de la reserva */}
            <span>
                <span className="MiPerfil-cuidadorNombre">{nombreCuidador}</span>
                <span className="MiPerfil-servicio">{NOMBRES_SERVICIO[tipoServicio] || tipoServicio}</span>
                <span className="MiPerfil-fecha">{fechaInicio} / {fechaFin}</span>
            </span>
            <span className="MiPerfil-estado">{estado}</span>
        </li>
    )
}

const Mascota = ( { _id, nombre, raza, especie, edadMeses, fotoUrl, vacunada, editarMascota, eliminarMascota } ) => {

    const [ editando, setEditando ] = useState(false)
    const formulario = useRef(null)

    const guardar = async ( e ) => {
        e.preventDefault()

        const { nombre, raza, especie, edadMeses, foto, vacunada } = formulario.current

        const datos = {
            nombre: nombre.value,
            raza: raza.value,
            especie: especie.value,
            edadMeses: edadMeses.value,
            fotoUrl: await leerFoto(foto, fotoUrl),
            vacunada: vacunada.checked
        }

        await editarMascota( _id, datos )

        setEditando(false)
    }
    if (editando) {
        return (
            <form className="Mascota Mascota--form" ref={formulario} onSubmit={guardar}>
                <input name="nombre" defaultValue={nombre} placeholder="Nombre" required />
                <input name="raza" defaultValue={raza} placeholder="Raza" />
                <select name="especie" defaultValue={especie}>
                    <option value="perro"> Perro </option>
                    <option value="gato"> Gato </option>
                </select>
                <label className="Mascota-campo">
                    <span>Edad (meses)</span>
                    <input name="edadMeses" type="number" defaultValue={edadMeses} />
                </label>
                {/* Si no se elige archivo se mantiene la foto actual */}
                <label className="Mascota-campo">
                    <span>Foto</span>
                    <input name="foto" type="file" accept="image/*" />
                </label>
                <label className="Mascota-check">
                    <input name="vacunada" type="checkbox" defaultChecked={vacunada} />
                    <span>Vacunado/a</span>
                </label>
                <div className="Mascota-acciones">
                    <button className="Mascota-cancelar" type="button" onClick={() => setEditando(false)}>Cancelar</button>
                    <button className="Mascota-guardar" type="submit">Guardar</button>
                </div>
            </form>
        )
    }

    return (
        <article className="Mascota">
            <div className="Mascota-imagen">
                {/* Si la mascota no tiene foto mostramos la imagen por defecto */}
                <img src={fotoUrl || '/mascota-default.svg'} alt={nombre} loading="lazy" />
            </div>
            <div className="Mascota-cuerpo">
                <div className="Mascota-fila">
                    <h4 className="Mascota-nombre">{nombre}</h4>
                    <span className="Mascota-edad">{edadMeses} meses</span>
                </div>
                <p className="Mascota-raza">{raza}</p>
                <div className="Mascota-tags">
                    <span className="Mascota-tag">{especie}</span>
                    { vacunada && <span className="Mascota-tag Mascota-tag--ok">Vacunado/a</span> }
                </div>
                <div className="Mascota-acciones">
                    <button className="Mascota-editar" type="button" onClick={() => setEditando(true)}>Editar</button>
                    <button className="Mascota-eliminar" type="button" onClick={() => eliminarMascota(_id)}>Eliminar</button>
                </div>
            </div>
        </article>
    )
}
