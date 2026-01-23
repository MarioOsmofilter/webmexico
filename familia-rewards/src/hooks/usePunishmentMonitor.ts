'use client';

import { useEffect, useState } from 'react';
import { usePunishment } from '@/lib/persistent-notification';

export const usePunishmentMonitor = (childId: string | null) => {
  const [isPunished, setIsPunished] = useState(false);
  const [punishmentReason, setPunishmentReason] = useState('');
  const { startPunishment, stopPunishment } = usePunishment();

  useEffect(() => {
    if (!childId) return;

    // Verificar estado de castigo cada 10 segundos
    const checkPunishmentStatus = async () => {
      try {
        const response = await fetch(`/api/punishment?childId=${childId}`);
        const data = await response.json();

        if (data.isActive && !isPunished) {
          // Activar castigo
          setIsPunished(true);
          setPunishmentReason(
            data.punishmentState?.reason || 'Dispositivo bloqueado'
          );

          // Iniciar notificaciones persistentes
          await startPunishment(
            '🚨 Dispositivo Bloqueado',
            data.punishmentState?.reason || 'Contacta con tus padres',
            data.punishmentState?.intervalSeconds || 30
          );
        } else if (!data.isActive && isPunished) {
          // Desactivar castigo
          setIsPunished(false);
          setPunishmentReason('');

          // Detener notificaciones
          await stopPunishment();
        }
      } catch (error) {
        console.error('Error checking punishment status:', error);
      }
    };

    // Verificar inmediatamente al montar
    checkPunishmentStatus();

    // Verificar cada 10 segundos
    const interval = setInterval(checkPunishmentStatus, 10000);

    return () => {
      clearInterval(interval);
    };
  }, [childId, isPunished, startPunishment, stopPunishment]);

  return { isPunished, punishmentReason };
};
