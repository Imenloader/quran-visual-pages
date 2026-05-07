import React from "react";
import PrayerCirclesComponent from "@/components/community/PrayerCirclesComponent";

const PrayerCircles = () => {
  return (
    <div className="min-h-screen bg-background pb-24 pt-6 px-4">
      <div className="max-w-4xl mx-auto">
        <PrayerCirclesComponent standalone={true} />
      </div>
    </div>
  );
};

export default PrayerCircles;
