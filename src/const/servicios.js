
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
export const HORAS_RESERVA = Array.from({ length: 24 * 4 }, (nada, indice) => {
    const horas = String(Math.floor(indice / 4)).padStart(2, '0')
    const minutos = String((indice % 4) * 15).padStart(2, '0')
    return `${horas}:${minutos}`
})
