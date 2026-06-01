package com.quraaniat.visual;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.widget.RemoteViews;

public class DailyVerseWidget extends AppWidgetProvider {

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId);
        }
    }

    static void updateAppWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_daily_verse);

        // Get data from SharedPreferences (CapacitorStorage)
        SharedPreferences prefs = context.getSharedPreferences("CapacitorStorage", Context.MODE_PRIVATE);
        String verseText = prefs.getString("widget_dailyVerse", "بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ");
        String verseTranslation = prefs.getString("widget_dailyVerseTranslation", "In the name of Allah, the Entirely Merciful, the Especially Merciful.");
        String verseSurah = prefs.getString("widget_dailyVerseSurah", "سورة الفاتحة");

        // Set Texts
        views.setTextViewText(R.id.widget_verse_text, verseText);
        views.setTextViewText(R.id.widget_verse_translation, verseTranslation);
        views.setTextViewText(R.id.widget_verse_surah, verseSurah);

        // Open app on click
        Intent intent = new Intent(context, MainActivity.class);
        PendingIntent pendingIntent = PendingIntent.getActivity(context, 0, intent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        views.setOnClickPendingIntent(R.id.widget_main_click, pendingIntent);

        appWidgetManager.updateAppWidget(appWidgetId, views);
    }
}
