
/* Convierte el archivo elegido en el input file a un data URL base64, reducido
con un canvas a un máximo de 512px para que las fotos no engorden la base de datos;
si no se elige ningún archivo devuelve la foto actual para no perderla */
export const leerFoto = ( input, fotoActual = '' ) => {

    return new Promise( (resolve) => {

        const archivo = input.files[0]

        if (!archivo) {
            resolve(fotoActual)
            return
        }

        const lector = new FileReader()

        lector.onload = () => {

            const imagen = new Image()

            imagen.onload = () => {

                /* La escala nunca amplía: solo reduce cuando el lado mayor pasa de 512px */
                const escala = Math.min(1, 512 / Math.max(imagen.width, imagen.height))

                const canvas = document.createElement('canvas')
                canvas.width = Math.round(imagen.width * escala)
                canvas.height = Math.round(imagen.height * escala)

                canvas.getContext('2d').drawImage(imagen, 0, 0, canvas.width, canvas.height)

                resolve(canvas.toDataURL('image/jpeg', .8))
            }

            imagen.src = lector.result
        }

        lector.readAsDataURL(archivo)
    })
}
