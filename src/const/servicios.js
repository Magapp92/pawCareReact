
/* Constantes compartidas por las páginas y componentes */

export const NOMBRES_SERVICIO = {
    cuidadoDiario: 'Guardería de día',
    largaEstancia: 'Larga estancia',
    paseador: 'Paseo',
    peluqueria: 'Peluquería'
}

export const CLAVES_SERVICIO = ['cuidadoDiario', 'largaEstancia', 'paseador', 'peluqueria']

export const LISTA_ANIMALES = ['perro', 'gato', 'conejo', 'ave']

/* Las horas del día de 15 en 15 ("00:00"... "23:45") para los selects de hora */
export const HORAS_RESERVA = []

for (let hora = 0; hora < 24; hora++) {
    for (const minutos of ['00', '15', '30', '45']) {
        HORAS_RESERVA.push(`${ String(hora).padStart(2, '0') }:${minutos}`)
    }
}

/* La fecha de hoy en el formato de los input date ('2026-09-19'), para no admitir reservas en días pasados */
const fecha = new Date()
const anio = fecha.getFullYear()
const mes = String(fecha.getMonth() + 1).padStart(2, '0')
const dia = String(fecha.getDate()).padStart(2, '0')
export const FECHA_HOY = `${anio}-${mes}-${dia}`

export const ahora = () => new Date().toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })
