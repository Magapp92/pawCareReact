
import { CLAVES_SERVICIO } from '@const/servicios'

/* Devuelve el precio de un servicio concreto del cuidador, o 0 si no lo ofrece o no tiene precio */
export const obtenerPrecioServicio = (preciosPorServicio, clave) => {

    const precio = Number(preciosPorServicio[clave])

    if (precio > 0) {
        return precio
    }
    return 0
}

/* Cuando no hay servicio elegido en el buscador, mostramos el precio del primero que ofrezca el cuidador */
export const obtenerPrecioPrimerServicio = (preciosPorServicio) => {

    const clave = CLAVES_SERVICIO.find( clave => Number(preciosPorServicio[clave]) > 0) || ''

    return obtenerPrecioServicio( preciosPorServicio, clave )
}