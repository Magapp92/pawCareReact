
/* Todas las páginas piden a la API por aquí: si la respuesta no es ok lanzamos
el mensaje que manda el servidor para que la página pueda mostrarlo.
Si hay sesión iniciada añadimos su token en la cabecera Authorization */
export const pedir = async ( url, options = {} ) => {

    const token = localStorage.getItem('token')

    if (token) {
        options.headers = { ...options.headers, Authorization: `Bearer ${token}` }
    }

    let respuesta

    try {
        respuesta = await fetch( url, options )
    } catch {
        throw new Error('No se ha podido conectar con el servidor')
    }

    const { message, data } = await respuesta.json().catch( () => ({}) )

    if (!respuesta.ok) {
        throw new Error( message || 'Error del servidor' )
    }

    return data
}
