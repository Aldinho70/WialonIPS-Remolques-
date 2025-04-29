import getInfoDevices from './src/api/wialon.js'
import { destructWialon } from './src/utils/utils.js'
import TcpClient from './src/tcp/Wialon_IPS.js';

const app = () => {
    getInfoDevices()
      .then((data) => {
        // console.log( data );
        
        return destructWialon( data );  
      })
      .then((devices) => {
        devices.map( _device => {
          const { login, fulldata, name } = _device;
          // console.log( login, fulldata );

          const tcpClient = new TcpClient(login, fulldata, name);
          tcpClient.connect();
        });
      })
      .catch((error) => {
        console.error(error);
      });
};

app();

setInterval(app, 60000);


/**
 * git remote add origin git@github-personal:Aldinho70/WialonIPS-Remolques-.git
 * git branch -M main
 * git push -u origin main
**/