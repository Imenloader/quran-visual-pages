package com.quraaniat.visual;

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

public class PrayerLandscapeWidget extends AppWidgetProvider {

    private static final String ACTION_UPDATE_COUNTDOWN = "com.quraaniat.visual.ACTION_UPDATE_COUNTDOWN_LANDSCAPE";

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
            int[] appWidgetIds = appWidgetManager.getAppWidgetIds(new ComponentName(context, PrayerLandscapeWidget.class));
            for (int appWidgetId : appWidgetIds) {
                updateAppWidget(context, appWidgetManager, appWidgetId);
            }
            scheduleNextUpdate(context);
        }
    }

    static void updateAppWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_prayer_landscape);

        // Get prayer times from SharedPreferences (CapacitorStorage)
        SharedPreferences prefs = context.getSharedPreferences("CapacitorStorage", Context.MODE_PRIVATE);
        String prayerTimesJson = prefs.getString("prayer_times_json", "");
        String hijriDate = prefs.getString("hijri_date", "--");

        // Set Hijri Date
        views.setTextViewText(R.id.widget_hijri_date, hijriDate);

        String nextPrayerKey = "";
        String nextPrayerTime = "";
        String lastPrayerTime = "";

        if (!prayerTimesJson.isEmpty()) {
            try {
                JSONObject times = new JSONObject(prayerTimesJson);
                String[] prayerOrder = {"Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"};
                
                // Set grid times
                views.setTextViewText(R.id.time_fajr, format12h(times.optString("Fajr")));
                views.setTextViewText(R.id.time_sunrise, format12h(times.optString("Sunrise")));
                views.setTextViewText(R.id.time_dhuhr, format12h(times.optString("Dhuhr")));
                views.setTextViewText(R.id.time_asr, format12h(times.optString("Asr")));
                views.setTextViewText(R.id.time_maghrib, format12h(times.optString("Maghrib")));
                views.setTextViewText(R.id.time_isha, format12h(times.optString("Isha")));

                SimpleDateFormat sdf = new SimpleDateFormat("HH:mm", Locale.US);
                Date now = new Date();
                
                boolean found = false;
                for (int i = 0; i < prayerOrder.length; i++) {
                    String name = prayerOrder[i];
                    String timeStr = times.optString(name);
                    if (timeStr.isEmpty()) continue;
                    
                    Date prayerTime = sdf.parse(timeStr);
                    Date targetDate = new Date();
                    targetDate.setHours(prayerTime.getHours());
                    targetDate.setMinutes(prayerTime.getMinutes());
                    targetDate.setSeconds(0);
                    
                    if (targetDate.after(now)) {
                        nextPrayerKey = name;
                        nextPrayerTime = timeStr;
                        // Get the last prayer time for progress calculation
                        if (i > 0) {
                            lastPrayerTime = times.optString(prayerOrder[i - 1]);
                        } else {
                            lastPrayerTime = times.optString("Isha"); // Previous day's Isha
                        }
                        found = true;
                        break;
                    }
                }
                
                if (!found) {
                    nextPrayerKey = "Fajr";
                    nextPrayerTime = times.optString("Fajr");
                    lastPrayerTime = times.optString("Isha");
                }

                // Highlight active container
                int[] containers = {R.id.row_fajr, R.id.row_sunrise, R.id.row_dhuhr, R.id.row_asr, R.id.row_maghrib, R.id.row_isha};
                for (int id : containers) {
                    views.setInt(id, "setBackgroundResource", 0);
                }
                int highlightId = getContainerId(nextPrayerKey);
                if (highlightId != 0) {
                    views.setInt(highlightId, "setBackgroundResource", R.drawable.widget_row_highlight);
                }

            } catch (Exception e) {
                // Ignore parsing errors gracefully
            }
        }

        if (!nextPrayerTime.isEmpty() && !lastPrayerTime.isEmpty()) {
            try {
                SimpleDateFormat sdf = new SimpleDateFormat("HH:mm", Locale.US);
                Date prayerDate = sdf.parse(nextPrayerTime);
                Date lastPrayerDate = sdf.parse(lastPrayerTime);
                Date now = new Date();
                
                Date targetDate = new Date();
                targetDate.setHours(prayerDate.getHours());
                targetDate.setMinutes(prayerDate.getMinutes());
                targetDate.setSeconds(0);

                Date previousDate = new Date();
                previousDate.setHours(lastPrayerDate.getHours());
                previousDate.setMinutes(lastPrayerDate.getMinutes());
                previousDate.setSeconds(0);

                if (targetDate.before(now)) {
                    targetDate.setTime(targetDate.getTime() + 24 * 60 * 60 * 1000);
                }
                
                if (previousDate.after(targetDate)) {
                    // This happens if next is Fajr and last is Isha
                    previousDate.setTime(previousDate.getTime() - 24 * 60 * 60 * 1000);
                } else if (previousDate.after(now)) {
                    previousDate.setTime(previousDate.getTime() - 24 * 60 * 60 * 1000);
                }

                // Calculate countdown
                long diff = targetDate.getTime() - now.getTime();
                long hours = diff / (60 * 60 * 1000);
                long minutes = (diff / (60 * 1000)) % 60;
                long seconds = (diff / 1000) % 60;

                views.setTextViewText(R.id.widget_countdown_hours, String.valueOf(hours));
                views.setTextViewText(R.id.widget_countdown_minutes, String.format(Locale.US, "%02d", minutes));
                views.setTextViewText(R.id.widget_countdown_seconds, String.format(Locale.US, "%02d", seconds));

                // Calculate progress
                long totalDuration = targetDate.getTime() - previousDate.getTime();
                long elapsedDuration = now.getTime() - previousDate.getTime();
                int progress = 1000 - (int) ((elapsedDuration * 1000L) / totalDuration); // Reverse so ring shrinks
                
                // Keep progress within bounds
                if (progress < 0) progress = 0;
                if (progress > 1000) progress = 1000;

                views.setProgressBar(R.id.widget_progress, 1000, progress, false);

            } catch (Exception e) {
                views.setTextViewText(R.id.widget_countdown_hours, "-");
                views.setTextViewText(R.id.widget_countdown_minutes, "--");
                views.setTextViewText(R.id.widget_countdown_seconds, "--");
                views.setProgressBar(R.id.widget_progress, 1000, 0, false);
            }
        }

        // Open app on click
        Intent intent = new Intent(context, MainActivity.class);
        PendingIntent pendingIntent = PendingIntent.getActivity(context, 0, intent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        views.setOnClickPendingIntent(R.id.widget_main_click, pendingIntent);

        appWidgetManager.updateAppWidget(appWidgetId, views);
    }

    private static String format12h(String time24) {
        if (time24 == null || time24.isEmpty()) return "--:-- AM";
        try {
            String[] parts = time24.split(":");
            int h = Integer.parseInt(parts[0]);
            int m = Integer.parseInt(parts[1]);
            String ampm = h >= 12 ? "PM" : "AM";
            int h12 = h % 12;
            if (h12 == 0) h12 = 12;
            return String.format(Locale.US, "%02d:%02d %s", h12, m, ampm);
        } catch (Exception e) {
            return time24;
        }
    }

    private static int getContainerId(String key) {
        switch (key) {
            case "Fajr": return R.id.row_fajr;
            case "Sunrise": return R.id.row_sunrise;
            case "Dhuhr": return R.id.row_dhuhr;
            case "Asr": return R.id.row_asr;
            case "Maghrib": return R.id.row_maghrib;
            case "Isha": return R.id.row_isha;
            default: return 0;
        }
    }

    private void scheduleNextUpdate(Context context) {
        AlarmManager am = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        Intent intent = new Intent(context, PrayerLandscapeWidget.class);
        intent.setAction(ACTION_UPDATE_COUNTDOWN);
        PendingIntent pi = PendingIntent.getBroadcast(context, 0, intent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        
        // Update every 1 second to make the seconds and ring smooth!
        long nextUpdate = System.currentTimeMillis() + 1000;
        if (am != null) {
            am.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, nextUpdate, pi);
        }
    }
}
