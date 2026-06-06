import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*', // For development. In prod, restrict this.
  },
  namespace: '/community',
})
export class CommunityGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(CommunityGateway.name);

  @WebSocketServer()
  server: Server;

  afterInit(server: Server) {
    this.logger.log('Community WebSocket Gateway initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    // In a real app with Friends system, we would extract the user ID from auth token
    // and join a personal room like `user_${userId}` so we can broadcast specifically to their friends.
    // client.join('feed_room');
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  /**
   * Broadcasts a new post event to all connected clients
   */
  broadcastNewPost(post: any) {
    this.server.emit('new_post', post);
  }
}
