import { registerPlugin } from '@capacitor/core';

export interface PersistentNotificationPlugin {
  startPersistentNotifications(options: {
    title: string;
    message: string;
    intervalSeconds: number;
  }): Promise<{ success: boolean; message: string }>;

  stopPersistentNotifications(): Promise<{ success: boolean; message: string }>;
}

const PersistentNotification = registerPlugin<PersistentNotificationPlugin>(
  'PersistentNotification'
);

export default PersistentNotification;

// Hook para usar en componentes React
export const usePunishment = () => {
  const startPunishment = async (
    title: string,
    message: string,
    intervalSeconds: number = 30
  ) => {
    try {
      const result = await PersistentNotification.startPersistentNotifications({
        title,
        message,
        intervalSeconds,
      });
      return result;
    } catch (error) {
      console.error('Error iniciando castigo:', error);
      return { success: false, message: 'Error al iniciar castigo' };
    }
  };

  const stopPunishment = async () => {
    try {
      const result = await PersistentNotification.stopPersistentNotifications();
      return result;
    } catch (error) {
      console.error('Error deteniendo castigo:', error);
      return { success: false, message: 'Error al detener castigo' };
    }
  };

  return { startPunishment, stopPunishment };
};
