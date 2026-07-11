
import { useState, useEffect } from 'react'

export const useCuidadores = () => {

    const { VITE_EXPRESS } = import.meta.env

    const [ cuidadores, setCuidadores ] = useState([])

    const getCuidadores = async () => {

        const peticion = await fetch(`${VITE_EXPRESS}/cuidadores`)
        const { data } = await peticion.json()

        setCuidadores(data)
    }

    useEffect(() => {
        getCuidadores()
    }, [])

    const buscarCuidadores = async (ubicacion, servicio, animales) => {

        let url = `${VITE_EXPRESS}/cuidadores`

        if (servicio) {
            url = `${VITE_EXPRESS}/cuidadores/servicios/${servicio}`
        }
        if (ubicacion && !servicio) {
            url = `${VITE_EXPRESS}/cuidadores/ubicacion/${ubicacion}`
        }

        const peticion = await fetch(url)

        const { data } = await peticion.json()

        let lista = data

        if (servicio) lista = lista.filter(cuidador => cuidador.servicios[servicio])
        if (ubicacion) lista = lista.filter(cuidador => cuidador.ubicacion.toLowerCase().includes(ubicacion.toLowerCase()))
        if (animales && animales.length > 0) lista = lista.filter(cuidador => animales.every(animal => cuidador.animalesQueAtiende.includes(animal)))

        setCuidadores(lista)
    }

    return { cuidadores, buscarCuidadores }
}
