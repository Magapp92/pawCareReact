
import { CLAVES_SERVICIO } from '../../const/servicios'

export const obtenerPrecioServicio = (preciosPorServicio, clave) => {

    const precio = Number(preciosPorServicio[clave])

    if (precio > 0) {
        return precio
    }
    return 0
}

export const obtenerPrecioPrimerServicio = (preciosPorServicio) => {

    const clave = CLAVES_SERVICIO.find( clave => Number(preciosPorServicio[clave]) > 0) || ''

    return obtenerPrecioServicio( preciosPorServicio, clave )
}