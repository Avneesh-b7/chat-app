import { useEffect, useState } from 'react';
import { socketService } from '../lib/socket';
import { useAuthStore } from '../store/authStore';

export const useSocket = () => {
  const { user } = useAuthStore();
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    // Connect
    socketService.connect(user._id);

    // Connection listeners
    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);
    const handleError = (err: any) => setError(err?.message || 'Socket error');

    socketService.on('connect', handleConnect);
    socketService.on('disconnect', handleDisconnect);
    socketService.on('connect_error', handleError);

    // Cleanup
    return () => {
      socketService.off('connect', handleConnect);
      socketService.off('disconnect', handleDisconnect);
      socketService.off('connect_error', handleError);
      socketService.disconnect();
    };
  }, [user]);

  return {
    isConnected,
    error,
    emit: socketService.emit.bind(socketService),
  };
};
