import { SocketIoConfig } from 'ngx-socket-io';

export const environment = {
  production: true,
  backUrl: 'http://localhost:3000',
  socketConfig: <SocketIoConfig>{ url: this.backUrl, options: {} }
};
