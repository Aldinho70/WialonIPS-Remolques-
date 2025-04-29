const axios = require('axios');
const net = require('net');

const credentials = {
    userName: "ventas@jornadadigitalgps.com",
    password: "venjornadadig",
    database: "r2r"
};

// IP y puerto del servidor
const serverIP = '193.193.165.165';
const serverPort = 20332;

const getSessionId = async (credentials) => {
    return axios.post('https://my.geotab.com/apiv1', {
        method: "Authenticate",
        params: credentials
    })
        .then(response => response.data.result.credentials.sessionId)
        .catch(error => {
            console.error("Error al autenticar:", error);
            throw error;
        });
};

const getLogRecordsWithGetFeed = async (credentials, feedVersion = null) => {
    return axios.post('https://my.geotab.com/apiv1', {
        method: 'Get',
        params: {
            typeName: "DeviceStatusInfo",
            credentials: credentials
        }
    })
        .then(response => response.data.result)
        .catch(error => {
            console.error("Error al obtener LogRecord:", error);
        });
};

const app = async (credentials) => {
    try {
        const sessionId = await getSessionId(credentials);
        const updatedCredentials = { ...credentials, sessionId };

        // Primera llamada a GetFeed sin 'feedVersion'
        const logRecordsData = await getLogRecordsWithGetFeed(updatedCredentials);
        logRecordsData.map(element => {
            const login = `#L#${element.device.id};NA`;
            const latitude = decimalToDMS(element.latitude);
            const longitude = decimalToDMSLong(element.longitude);
            const ignicion = (element.isDriving) ? '1' : '0';
            const jamming = (element.isDeviceCommunicating) ? '0' : '1';
            const datetime = parseDateTime(element.dateTime);
            const shortData = `#SD#NA;NA;${latitude};N;${longitude};W;${element.speed};0;0;21`;
            // const trama = `#D#NA;NA;${latitude};N;${longitude};W;60;90;500;5;0.8;3;2;14.77,0.02,3.6;NA;ignition:1:1,jamming:1:1`;
            const FullData = `#D#${datetime};${latitude};N;${longitude};W;${element.speed};0;0;21;NA;NA;NA;NA;NA;ignition:1:${ignicion},jamming:1:${jamming}`;

            // Conectar al servidor y enviar datos
            const client = new net.Socket();
            client.connect(serverPort, serverIP, () => {
                console.log('Conectado al servidor');
                client.write(login + '\r\n', () => {
                    client.write(FullData + '\r\n');
                });
            });

            client.on('data', (data) => {
                console.log('Respuesta del servidor:', data.toString());
            });

            client.on('close', () => {
                console.log('Conexión cerrada');
            });

            client.on('error', (err) => {
                console.error('Error en la conexión:', err.message);
            });
        });
    } catch (error) {
        console.error("Error:", error);
    }
};

/**
 * Llamar a la función principal
 * */
app(credentials);
setInterval(() => { app(credentials) }, 60000);

/**
 * Convierte coordenadas decimales a formato DMS (Latitud)
 */
function decimalToDMS(decimal) {
    const degrees = Math.floor(decimal);
    const minutes = (decimal - degrees) * 60;
    return `${degrees}${minutes.toFixed(2).padStart(5, '0')}`;
}

/**
 * Convierte coordenadas decimales a formato DMS (Longitud)
 */
function decimalToDMSLong(decimal) {
    const isNegative = decimal < 0;
    const absDecimal = Math.abs(decimal);
    const degrees = Math.floor(absDecimal);
    const minutes = (absDecimal - degrees) * 60;
    const formattedDegrees = String(degrees).padStart(3, '0');
    const formattedMinutes = minutes.toFixed(2).padStart(5, '0');
    return `${formattedDegrees}${formattedMinutes}`;
}

function parseDateTime(dateString) {
    // Verificar si la fecha es válida
    if (!dateString) return { Date: "NA", Time: "NA" };

    try {
        // Convertir la cadena a objeto de fecha en UTC
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return { Date: "NA", Time: "NA" };

        // Formatear la fecha en DDMMYY
        const day = String(date.getUTCDate()).padStart(2, '0');
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const year = String(date.getUTCFullYear()).slice(-2);

        // Formatear la hora en HHMMSS
        const hours = String(date.getUTCHours()).padStart(2, '0');
        const minutes = String(date.getUTCMinutes()).padStart(2, '0');
        const seconds = String(date.getUTCSeconds()).padStart(2, '0');

        return  (`${day}${month}${year};${hours}${minutes}${seconds}`)
    } catch (error) {
        // En caso de error, retornar "NA"
        return  (`NA;NA`);
    }
}