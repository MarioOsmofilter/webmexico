package com.familiarewards.plugin;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.media.AudioAttributes;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.Build;
import android.os.VibrationEffect;
import android.os.Vibrator;
import androidx.core.app.NotificationCompat;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.util.Timer;
import java.util.TimerTask;

@CapacitorPlugin(name = "PersistentNotification")
public class PersistentNotificationPlugin extends Plugin {

    private static final String CHANNEL_ID = "PUNISHMENT_CHANNEL";
    private static final int NOTIFICATION_ID = 999;
    private Timer notificationTimer;
    private NotificationManager notificationManager;

    @Override
    public void load() {
        super.load();
        createNotificationChannel();
    }

    // Crear canal de notificaciones (Android 8+)
    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            CharSequence name = "Control Parental";
            String description = "Notificaciones de control parental";
            int importance = NotificationManager.IMPORTANCE_HIGH;

            NotificationChannel channel = new NotificationChannel(CHANNEL_ID, name, importance);
            channel.setDescription(description);
            channel.enableVibration(true);
            channel.setVibrationPattern(new long[]{0, 500, 250, 500});
            channel.setSound(
                RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION),
                new AudioAttributes.Builder()
                    .setUsage(AudioAttributes.USAGE_NOTIFICATION)
                    .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                    .build()
            );
            channel.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);
            channel.setBypassDnd(true); // Evitar modo No Molestar

            notificationManager = getContext().getSystemService(NotificationManager.class);
            notificationManager.createNotificationChannel(channel);
        }
    }

    // Iniciar notificaciones persistentes
    @PluginMethod
    public void startPersistentNotifications(PluginCall call) {
        String title = call.getString("title", "🚨 Dispositivo Bloqueado");
        String message = call.getString("message", "Contacta con tus padres para desbloquear");
        int intervalSeconds = call.getInt("intervalSeconds", 30);

        // Cancelar timer anterior si existe
        if (notificationTimer != null) {
            notificationTimer.cancel();
        }

        // Crear nuevo timer
        notificationTimer = new Timer();
        notificationTimer.scheduleAtFixedRate(new TimerTask() {
            @Override
            public void run() {
                showPersistentNotification(title, message);
                vibrate();
                playSound();
            }
        }, 0, intervalSeconds * 1000);

        JSObject ret = new JSObject();
        ret.put("success", true);
        ret.put("message", "Notificaciones persistentes iniciadas");
        call.resolve(ret);
    }

    // Detener notificaciones persistentes
    @PluginMethod
    public void stopPersistentNotifications(PluginCall call) {
        if (notificationTimer != null) {
            notificationTimer.cancel();
            notificationTimer = null;
        }

        // Cancelar notificación
        if (notificationManager != null) {
            notificationManager.cancel(NOTIFICATION_ID);
        }

        JSObject ret = new JSObject();
        ret.put("success", true);
        ret.put("message", "Notificaciones persistentes detenidas");
        call.resolve(ret);
    }

    // Mostrar notificación persistente
    private void showPersistentNotification(String title, String message) {
        Context context = getContext();
        Intent intent = context.getPackageManager().getLaunchIntentForPackage(context.getPackageName());

        PendingIntent pendingIntent = PendingIntent.getActivity(
            context,
            0,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        NotificationCompat.Builder builder = new NotificationCompat.Builder(context, CHANNEL_ID)
            .setSmallIcon(android.R.drawable.ic_dialog_alert)
            .setContentTitle(title)
            .setContentText(message)
            .setPriority(NotificationCompat.PRIORITY_MAX)
            .setCategory(NotificationCompat.CATEGORY_ALARM)
            .setOngoing(true) // Notificación persistente, no se puede deslizar para cerrar
            .setAutoCancel(false) // No se cancela al hacer clic
            .setContentIntent(pendingIntent)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .setDefaults(Notification.DEFAULT_ALL)
            .setVibrate(new long[]{0, 500, 250, 500})
            .setSound(RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION))
            .setStyle(new NotificationCompat.BigTextStyle()
                .bigText(message + "\n\nEsta notificación no se puede cancelar hasta que tus padres desactiven el castigo."));

        if (notificationManager == null) {
            notificationManager = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
        }

        notificationManager.notify(NOTIFICATION_ID, builder.build());
    }

    // Vibrar dispositivo
    private void vibrate() {
        Vibrator vibrator = (Vibrator) getContext().getSystemService(Context.VIBRATOR_SERVICE);
        if (vibrator != null && vibrator.hasVibrator()) {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                vibrator.vibrate(VibrationEffect.createWaveform(new long[]{0, 500, 250, 500}, -1));
            } else {
                vibrator.vibrate(new long[]{0, 500, 250, 500}, -1);
            }
        }
    }

    // Reproducir sonido
    private void playSound() {
        try {
            Uri notification = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION);
            RingtoneManager.getRingtone(getContext(), notification).play();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
