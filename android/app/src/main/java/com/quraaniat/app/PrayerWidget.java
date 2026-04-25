package com.quraaniat.app;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.widget.RemoteViews;

import org.json.JSONObject;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

public class PrayerWidget extends AppWidgetProvider {

    private static final String ACTION_UPDATE_COUNTDOWN = "com.quraaniat.app.ACTION_UPDATE_COUNTDOWN";

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId);
        }
        scheduleNextUpdate(context);
    }

    @Override
    public void onReceive(Context context, Intent intent) {
        super.onReceive(context, intent);
        if (ACTION_UPDATE_COUNTDOWN.equals(intent.getAction())) {
            AppWidgetManager appWidgetManager = AppWidgetManager.getInstance(context);
            int[] appWidgetIds = appWidgetManager.getAppWidgetIds(new ComponentName(context, PrayerWidget.class));
            for (int appWidgetId : appWidgetIds) {
                updateAppWidget(context, appWidgetManager, appWidgetId);
            }
            scheduleNextUpdate(context);
        }
    }

    static void updateAppWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.prayer_widget);

        // Get prayer times from SharedPreferences (CapacitorStorage)
        SharedPreferences prefs = context.getSharedPreferences("CapacitorStorage", Context.MODE_PRIVATE);
        String cityName = prefs.getString("city_name", "Quraaniat");
        String prayerTimesJson = prefs.getString("prayer_times_json", "");

        String nextPrayerName = "قيد الانتظار...";
        String nextPrayerTime = "";

        if (!prayerTimesJson.isEmpty()) {
            try {
                JSONObject times = new JSONObject(prayerTimesJson);
                String[] prayerOrder = {"Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"};
                
                SimpleDateFormat sdf = new SimpleDateFormat("HH:mm", Locale.US);
                Date now = new Date();
                
                boolean found = false;
                for (String name : prayerOrder) {
                    String timeStr = times.optString(name);
                    if (timeStr.isEmpty()) continue;
                    
                    Date prayerTime = sdf.parse(timeStr);
                    Date targetDate = new Date();
                    targetDate.setHours(prayerTime.getHours());
                    targetDate.setMinutes(prayerTime.getMinutes());
                    targetDate.setSeconds(0);
                    
                    if (targetDate.after(now)) {
                        nextPrayerName = getPrayerNameAr(name);
                        nextPrayerTime = timeStr;
                        found = true;
                        break;
                    }
                }
                
                if (!found) {
                    // All prayers today have passed, show tomorrow's Fajr
                    nextPrayerName = getPrayerNameAr("Fajr");
                    nextPrayerTime = times.optString("Fajr");
                }
            } catch (Exception e) {
                nextPrayerName = "خطأ في البيانات";
            }
        }

        views.setTextViewText(R.id.widget_prayer_name, "صلاة " + nextPrayerName);
        views.setTextViewText(R.id.widget_city, cityName);

        if (!nextPrayerTime.isEmpty()) {
            try {
                SimpleDateFormat sdf = new SimpleDateFormat("HH:mm", Locale.US);
                Date prayerDate = sdf.parse(nextPrayerTime);
                Date now = new Date();
                
                Date targetDate = new Date();
                targetDate.setHours(prayerDate.getHours());
                targetDate.setMinutes(prayerDate.getMinutes());
                targetDate.setSeconds(0);

                if (targetDate.before(now)) {
                    targetDate.setTime(targetDate.getTime() + 24 * 60 * 60 * 1000);
                }

                long diff = targetDate.getTime() - now.getTime();
                long hours = diff / (60 * 60 * 1000);
                long minutes = (diff / (60 * 1000)) % 60;

                String countdown = String.format(Locale.US, "%02d:%02d", (int)hours, (int)minutes);
                views.setTextViewText(R.id.widget_countdown, countdown);
            } catch (Exception e) {
                views.setTextViewText(R.id.widget_countdown, "--:--");
            }
        } else {
            views.setTextViewText(R.id.widget_countdown, "--:--");
        }

        // Open app on click
        Intent intent = new Intent(context, MainActivity.class);
        PendingIntent pendingIntent = PendingIntent.getActivity(context, 0, intent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        views.setOnClickPendingIntent(R.id.widget_countdown, pendingIntent);

        appWidgetManager.updateAppWidget(appWidgetId, views);
    }

    private static String getPrayerNameAr(String name) {
        switch (name) {
            case "Fajr": return "الفجر";
            case "Sunrise": return "الشروق";
            case "Dhuhr": return "الظهر";
            case "Asr": return "العصر";
            case "Maghrib": return "المغرب";
            case "Isha": return "العشاء";
            default: return name;
        }
    }

    private void scheduleNextUpdate(Context context) {
        AlarmManager am = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        Intent intent = new Intent(context, PrayerWidget.class);
        intent.setAction(ACTION_UPDATE_COUNTDOWN);
        PendingIntent pi = PendingIntent.getBroadcast(context, 0, intent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        
        // Schedule for 1 minute from now
        long nextUpdate = System.currentTimeMillis() + 60000;
        if (am != null) {
            am.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, nextUpdate, pi);
        }
    }
}
