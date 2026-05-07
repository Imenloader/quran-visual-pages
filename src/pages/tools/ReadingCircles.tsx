import React from "react";
import ReadingCirclesComponent from "@/components/community/ReadingCirclesComponent";

const ReadingCircles = () => {
  return (
    <div className="min-h-screen bg-background pb-24 pt-6 px-4">
      <div className="max-w-2xl mx-auto">
        <ReadingCirclesComponent standalone={true} />
      </div>
    </div>
  );
};

export default ReadingCircles;
