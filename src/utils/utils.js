/**
 * Convierte coordenadas decimales a formato DMS (Latitud)
 */
export function decimalToDMS(decimal) {
    const degrees = Math.floor(decimal);
    const minutes = (decimal - degrees) * 60;
    return `${degrees}${minutes.toFixed(2).padStart(5, '0')}`;
}

/**
 * Convierte coordenadas decimales a formato DMS (Longitud)
 */
export function decimalToDMSLong(decimal) {
    const isNegative = decimal < 0;
    const absDecimal = Math.abs(decimal);
    const degrees = Math.floor(absDecimal);
    const minutes = (absDecimal - degrees) * 60;
    const formattedDegrees = String(degrees).padStart(3, '0');
    const formattedMinutes = minutes.toFixed(2).padStart(5, '0');
    return `${formattedDegrees}${formattedMinutes}`;
}

// export function parseDateTime(dateString) {
//     // Verificar si la fecha es válida
//     if (!dateString) return { Date: "NA", Time: "NA" };

//     try {
//         // Convertir la cadena a objeto de fecha en UTC
//         const date = new Date(dateString);
//         if (isNaN(date.getTime())) return { Date: "NA", Time: "NA" };

//         // Formatear la fecha en DDMMYY
//         const day = String(date.getUTCDate()).padStart(2, '0');
//         const month = String(date.getUTCMonth() + 1).padStart(2, '0');
//         const year = String(date.getUTCFullYear()).slice(-2);

//         // Formatear la hora en HHMMSS
//         const hours = String(date.getUTCHours()).padStart(2, '0');
//         const minutes = String(date.getUTCMinutes()).padStart(2, '0');
//         const seconds = String(date.getUTCSeconds()).padStart(2, '0');

//         return  (`${day}${month}${year};${hours}${minutes}${seconds}`)
//     } catch (error) {
//         // En caso de error, retornar "NA"
//         return  (`NA;NA`);
//     }
// }

export function parseDateTime(timestamp) {
    // Verificar si el timestamp es válido
    if (!timestamp) return { Date: "NA", Time: "NA" };

    try {
        // Convertir el timestamp a objeto Date en UTC
        const date = new Date(timestamp * 1000);  // Multiplicamos por 1000 para convertir a milisegundos
        if (isNaN(date.getTime())) return { Date: "NA", Time: "NA" };

        // Formatear la fecha en DDMMYY
        const day = String(date.getUTCDate()).padStart(2, '0');
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const year = String(date.getUTCFullYear()).slice(-2);

        // Formatear la hora en HHMMSS
        const hours = String(date.getUTCHours()).padStart(2, '0');
        const minutes = String(date.getUTCMinutes()).padStart(2, '0');
        const seconds = String(date.getUTCSeconds()).padStart(2, '0');

        return `${day}${month}${year};${hours}${minutes}${seconds}`;
    } catch (error) {
        // En caso de error, retornar "NA"
        return 'NA;NA';
    }
}

/**
 * Desestrucuturar las respuesta de getInfoDevice
 */

export const destructWialon = (data) => {
  const deviceInfoList = [];
  data.map( element => {
    const REGEX_IGNITION = /(I(GN|GN|N)?(I|IN)?(CI)?(Ó|O)N?)/i;
    
    const { nm, id, pos, prms, netconn, lmsg, sens  } = element;
    const { y, x, s, t } = pos;
    const { p } = lmsg;
    const { pwr_ext } = p;
    const lat = decimalToDMS( y );
    const lon = decimalToDMSLong( x );
    const time = parseDateTime(t); 
    let params_sens_ignition;
    
    Object.values(sens).forEach((sens) => {
        const { n, p } = sens; 
        if ( REGEX_IGNITION.test(n) || n == 'IGN') {
            params_sens_ignition = p;
        }
    });

    const ignition = prms?.[params_sens_ignition]?.v ?? 0;

    deviceInfoList.push ({ 
        name: nm,
        device_id: id,
        timestamp: t,
        latatitude: x,
        longitude: y,
        speed : s,
        ignicion: ignition,
        power_ext : pwr_ext,
        network_connection: netconn,
        login: `#L#${id};NA`,
        fulldata: `#D#${time};${lat};N;${lon};W;${s};0;0;21;NA;NA;NA;NA;NA;ignition:1:${ignition},network_connection:1:${netconn}`,
    });
    
    
});
    console.table(
        deviceInfoList.map(({ fulldata, login, ...rest }) => rest)
    );
  return deviceInfoList;  
}
