import { useState, useRef, useEffect } from "react";

import sortedIndexBy from "lodash/sortedIndexBy";

import { ControlBar } from "./ControlBar";
import { SubtitlesContainer } from "./SubtitlesContainer";
import { SubtitlesSelector } from "./SubtitlesSelector";

export const SubtitlesPlayer = () => {
  const requestAnimationFrameRef = useRef();

  const [subtitles, setSubtitles] = useState([]);
  const [sentences, setSentences] = useState([]);

  const [isPlaying, setIsPlaying] = useState(false);

  const [followSubtitles, setFollowSubtitles] = useState(true);
  const [currentSubIndex, setCurrentSubIndex] = useState(0);

  const [startTime, setStartTime] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalTime, setTotalTime] = useState(0);

  const updateSubtitles = (subs) => {
    setIsPlaying(false);
    setTimeout(() => {
      setCurrentTime(0);
    });
    setSubtitles(subs);
    setTotalTime(subs.at(-1).endSeconds * 1000);
  };

  useEffect(() => {
    const animate = (time) => {
      if (!isPlaying) return;
      let newCurrentTime = time - startTime;
      if (newCurrentTime < 0) newCurrentTime = 0;
      if (newCurrentTime > totalTime) {
        newCurrentTime = totalTime;
        setIsPlaying(false);
      }
      setCurrentTime(newCurrentTime);
      requestAnimationFrameRef.current = requestAnimationFrame(animate);
    };

    requestAnimationFrameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestAnimationFrameRef.current);
  }, [isPlaying, startTime, totalTime]);

  useEffect(() => {
    setCurrentSubIndex(
      sortedIndexBy(
        subtitles,
        { endSeconds: currentTime / 1000 },
        (s) => s.endSeconds
      )
    );
  }, [currentTime, subtitles]);

  return (
    <div className="subtitles-player">
      <SubtitlesSelector
        updateSubtitles={updateSubtitles}
        setSentences={setSentences}
      />
      <SubtitlesContainer
        subtitles={subtitles}
        followSubtitles={followSubtitles}
        setFollowSubtitles={setFollowSubtitles}
        currentSubIndex={currentSubIndex}
        sentences={sentences}
      />
      <ControlBar
        currentTime={currentTime}
        totalTime={totalTime}
        setCurrentTime={setCurrentTime}
        setStartTime={setStartTime}
        isPlaying={isPlaying}
        setIsPlaying={setIsPlaying}
      />
    </div>
  );
};
