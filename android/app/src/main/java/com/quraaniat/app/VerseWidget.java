package com.quraaniat.app;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.widget.RemoteViews;

public class VerseWidget extends AppWidgetProvider {

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId);
        }
    }

    static void updateAppWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.verse_widget);

        // Get verse from SharedPreferences (CapacitorStorage)
        SharedPreferences prefs = context.getSharedPreferences("CapacitorStorage", Context.MODE_PRIVATE);
        String verseText = prefs.getString("daily_verse_text", "جاري تحميل آية اليوم من التطبيق...");
        String verseRef = prefs.getString("daily_verse_ref", "");

        views.setTextViewText(R.id.widget_verse_text, verseText);
        views.setTextViewText(R.id.widget_verse_ref, verseRef);

        // Open app on click
        Intent intent = new Intent(context, MainActivity.class);
        PendingIntent pendingIntent = PendingIntent.getActivity(context, 0, intent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        views.setOnClickPendingIntent(R.id.widget_verse_text, pendingIntent);

        appWidgetManager.updateAppWidget(appWidgetId, views);
    }
}
