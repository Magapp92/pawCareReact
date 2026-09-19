
import { useState, useEffect } from 'react'
import { pedir } from '@components/peticiones/peticiones'

export const useCuidadores = () => {

    const { VITE_EXPRESS } = import.meta.env

    const [ cuidadores, setCuidadores ] = useState([])

    /* Mensaje de error si la API no responde; la página lo muestra en vez de una lista vacía */
    const [ error, setError ] = useState('')

    const getCuidadores = async () => {

        try {
            const data = await pedir(`${VITE_EXPRESS}/cuidadores`)

            setCuidadores(data)
        } catch (fallo) {
            setError( fallo.message )
        }
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

        try {
            const data = await pedir(url)

            let lista = data

            if (servicio) lista = lista.filter(cuidador => cuidador.servicios[servicio])
            if (ubicacion) lista = lista.filter(cuidador => cuidador.ubicacion.toLowerCase().includes(ubicacion.toLowerCase()))
            if (animales && animales.length > 0) lista = lista.filter(cuidador => animales.every(animal => cuidador.animalesQueAtiende.includes(animal)))

            setCuidadores(lista)
        } catch (fallo) {
            setError( fallo.message )
        }
    }

    return { cuidadores, error, buscarCuidadores }
}
