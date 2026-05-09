package com.quraaniat.visual;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.view.View;
import android.widget.RemoteViews;

import org.json.JSONObject;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

public class PrayerWidget extends AppWidgetProvider {

    private static final String ACTION_UPDATE_COUNTDOWN = "com.quraaniat.visual.ACTION_UPDATE_COUNTDOWN";

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
        String hijriDate = prefs.getString("hijri_date", "--");

        // Dates
        SimpleDateFormat sdfDate = new SimpleDateFormat("d MMM yyyy", Locale.US);
        views.setTextViewText(R.id.widget_gregorian_date, sdfDate.format(new Date()));
        views.setTextViewText(R.id.widget_hijri_date, hijriDate);
        views.setTextViewText(R.id.widget_city, cityName);

        String nextPrayerName = "قيد الانتظار...";
        String nextPrayerTime = "";
        String nextPrayerKey = "";

        if (!prayerTimesJson.isEmpty()) {
            try {
                JSONObject times = new JSONObject(prayerTimesJson);
                String[] prayerOrder = {"Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"};
                
                // Set grid times
                views.setTextViewText(R.id.widget_fajr_time, format12h(times.optString("Fajr")));
                views.setTextViewText(R.id.widget_sunrise_time, format12h(times.optString("Sunrise")));
                views.setTextViewText(R.id.widget_dhuhr_time, format12h(times.optString("Dhuhr")));
                views.setTextViewText(R.id.widget_asr_time, format12h(times.optString("Asr")));
                views.setTextViewText(R.id.widget_maghrib_time, format12h(times.optString("Maghrib")));
                views.setTextViewText(R.id.widget_isha_time, format12h(times.optString("Isha")));

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
                        nextPrayerKey = name;
                        nextPrayerName = getPrayerNameAr(name);
                        nextPrayerTime = timeStr;
                        found = true;
                        break;
                    }
                }
                
                if (!found) {
                    nextPrayerKey = "Fajr";
                    nextPrayerName = getPrayerNameAr("Fajr");
                    nextPrayerTime = times.optString("Fajr");
                }

                // Highlight active container
                int[] containers = {R.id.container_fajr, R.id.container_sunrise, R.id.container_dhuhr, R.id.container_asr, R.id.container_maghrib, R.id.container_isha};
                for (int id : containers) {
                    views.setInt(id, "setBackgroundResource", 0);
                }
                int highlightId = getContainerId(nextPrayerKey);
                if (highlightId != 0) {
                    views.setInt(highlightId, "setBackgroundResource", R.drawable.widget_item_highlight);
                }

            } catch (Exception e) {
                nextPrayerName = "خطأ";
            }
        }

        views.setTextViewText(R.id.widget_prayer_name, "صلاة " + nextPrayerName);

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
                long seconds = (diff / 1000) % 60;

                String countdown = String.format(Locale.US, "%02d:%02d:%02d", (int)hours, (int)minutes, (int)seconds);
                views.setTextViewText(R.id.widget_countdown, countdown);
            } catch (Exception e) {
                views.setTextViewText(R.id.widget_countdown, "--:--");
            }
        }

        // Open app on click
        Intent intent = new Intent(context, MainActivity.class);
        PendingIntent pendingIntent = PendingIntent.getActivity(context, 0, intent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        views.setOnClickPendingIntent(R.id.widget_main_click, pendingIntent);

        appWidgetManager.updateAppWidget(appWidgetId, views);
    }

    private static String format12h(String time24) {
        if (time24 == null || time24.isEmpty()) return "--:--";
        try {
            String[] parts = time24.split(":");
            int h = Integer.parseInt(parts[0]);
            int m = Integer.parseInt(parts[1]);
            int h12 = h % 12;
            if (h12 == 0) h12 = 12;
            return String.format(Locale.US, "%d:%02d", h12, m);
        } catch (Exception e) {
            return time24;
        }
    }

    private static int getContainerId(String key) {
        switch (key) {
            case "Fajr": return R.id.container_fajr;
            case "Sunrise": return R.id.container_sunrise;
            case "Dhuhr": return R.id.container_dhuhr;
            case "Asr": return R.id.container_asr;
            case "Maghrib": return R.id.container_maghrib;
            case "Isha": return R.id.container_isha;
            default: return 0;
        }
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
        
        // Schedule for 1 second from now for smooth countdown
        // Note: For battery efficiency, 1 minute is better, but user asked for "complete widget"
        // Most widgets update every minute. I'll use 1 minute to be safe and avoid being killed by OS.
        long nextUpdate = System.currentTimeMillis() + 60000;
        if (am != null) {
            am.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, nextUpdate, pi);
        }
    }
}
