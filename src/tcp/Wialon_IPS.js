import net from 'net';

export default class TcpClient {
    constructor(login, fullData, name) {
        this.serverIP = process.env.SERVER_IP || '193.193.165.165';
        this.serverPort = process.env.SERVER_PORT || 20332;
        this.login = login;
        this.fullData = fullData;
        this.client = new net.Socket();
        this.name = name;
        
        // Vincula los eventos a los métodos de la clase
        this.client.on('data', this.onData.bind(this));
        this.client.on('close', this.onClose.bind(this));
        this.client.on('error', this.onError.bind(this));
    }

    connect() {
        this.client.connect(this.serverPort, this.serverIP, () => {
            // console.log('Conectado al servidor');
            this.client.write(this.login + '\r\n', () => {
                this.client.write(this.fullData + '\r\n');
            });
        });
    }

    onData(data) {
        // console.log('Respuesta del servidor:', data.toString());
        if( data.toString() == '#AL#1\r\n' ){
            console.table({
                ["Economico"]: this.name,
                ["Login"]: data.toString(),
                ["Respuesta servidor"]: 'Ok',
                ["Wialon"]: 'Conexion exitosa con servidor Wialon(Rusia)',
            });
        }else{
            console.table({
                ["Economico"]: this.name,
                ["Login"]: data.toString(),
                ["Respuesta servidor"]: 'Err',
                ["Wialon"]: 'Conexion rechasada con servidor Wialon(Rusia)',
            });

        }
    }

    onClose() {
        // console.log('Conexión cerrada');
    }

    onError(err) {
        console.error('Error en la conexión:', err.message);
    }

    disconnect() {
        this.client.destroy(); // Cierra la conexión
    }
}
/**
 * Ejemplo de uso de la clase
 * 
    const serverIP = '192.168.1.1'; // Cambia esto por la IP de tu servidor
    const serverPort = 8080; // Cambia esto por el puerto de tu servidor
    const login = 'miLogin';
    const FullData = 'misDatos';

    const tcpClient = new TcpClient(serverIP, serverPort, login, FullData);
    tcpClient.connect(); 
 */