
/* Constantes compartidas por las páginas y componentes */

export const NOMBRES_SERVICIO = {
    cuidadoDiario: 'Guardería de día',
    largaEstancia: 'Larga estancia',
    paseador: 'Paseo',
    peluqueria: 'Peluquería'
}

export const CLAVES_SERVICIO = ['cuidadoDiario', 'largaEstancia', 'paseador', 'peluqueria']

export const LISTA_ANIMALES = ['perro', 'gato', 'conejo', 'ave']

/* Las horas del día de 15 en 15 para los selects de hora */
export const HORAS_RESERVA = Array.from({ length: 24 * 4 }, (nada, indice) => {
    const horas = String(Math.floor(indice / 4)).padStart(2, '0')
    const minutos = String((indice % 4) * 15).padStart(2, '0')
    return `${horas}:${minutos}`
})

/* La fecha de hoy en el formato de los input date ('2026-09-19'), para no admitir reservas en días pasados */
const fecha = new Date()
const anio = fecha.getFullYear()
const mes = String(fecha.getMonth() + 1).padStart(2, '0')
const dia = String(fecha.getDate()).padStart(2, '0')
export const FECHA_HOY = `${anio}-${mes}-${dia}`
