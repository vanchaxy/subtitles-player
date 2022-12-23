import { useRef } from "react";
import { BsFillPauseFill, BsFillPlayFill } from "react-icons/bs";

import Slider from "rc-slider";
import "rc-slider/assets/index.css";

const FormattedTime = ({ className, milliseconds }) => {
  const minutes = Math.floor(milliseconds / 60000);
  const seconds = Math.floor(milliseconds / 1000) % 60;

  return (
    <div className={className}>{`${minutes}:${("0" + seconds).slice(-2)}`}</div>
  );
};

const ProgressSlider = ({
  currentTime,
  totalTime,
  setCurrentTime,
  setStartTime,
  isPlaying,
  setIsPlaying,
}) => {
  const wasPlayingBeforeDragging = useRef(false);

  return (
    <Slider
      value={currentTime}
      max={totalTime}
      onChange={(value) => {
        setCurrentTime(value);
      }}
      onBeforeChange={() => {
        wasPlayingBeforeDragging.current = isPlaying;
        setIsPlaying(false);
      }}
      onAfterChange={(value) => {
        setStartTime(performance.now() - value);
        if (wasPlayingBeforeDragging.current) {
          setIsPlaying(true);
        }
      }}
    />
  );
};

const ProgressBar = ({
  currentTime,
  totalTime,
  setCurrentTime,
  setStartTime,
  isPlaying,
  setIsPlaying,
}) => {
  return (
    <div className="progress-bar">
      <FormattedTime
        className="current formatted-time"
        milliseconds={currentTime}
      />
      <div className="slider">
        <ProgressSlider
          currentTime={currentTime}
          totalTime={totalTime}
          setCurrentTime={setCurrentTime}
          setStartTime={setStartTime}
          isPlaying={isPlaying}
          setIsPlaying={setIsPlaying}
        />
      </div>
      <FormattedTime
        className="total formatted-time"
        milliseconds={totalTime}
      />
    </div>
  );
};

const ButtonsBar = ({
  currentTime,
  totalTime,
  setCurrentTime,
  setStartTime,
  isPlaying,
  setIsPlaying,
}) => {
  const getForwardCallback = (forwardMs) => {
    return () => {
      let newCurrentTime = currentTime + forwardMs;
      if (newCurrentTime > totalTime) {
        newCurrentTime = totalTime;
      }
      if (newCurrentTime < 0) {
        newCurrentTime = 0;
      }
      isPlaying
        ? setStartTime(performance.now() - newCurrentTime)
        : setCurrentTime(newCurrentTime);
    };
  };

  const togglePlay = () => {
    if (!isPlaying) {
      currentTime === totalTime
        ? setStartTime(performance.now())
        : setStartTime(performance.now() - currentTime);
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="buttons-bar">
      <button onClick={getForwardCallback(-30_000)}>-30</button>
      <button onClick={getForwardCallback(-5_000)}>-5</button>
      <button onClick={getForwardCallback(-1_000)}>-1</button>
      <button onClick={getForwardCallback(-100)}>-0.1</button>

      <button className="play-pause-btn" onClick={togglePlay}>
        {isPlaying ? <BsFillPauseFill /> : <BsFillPlayFill />}
      </button>

      <button onClick={getForwardCallback(100)}>+0.1</button>
      <button onClick={getForwardCallback(1_000)}>+1</button>
      <button onClick={getForwardCallback(5_000)}>+5</button>
      <button onClick={getForwardCallback(30_000)}>+30</button>
    </div>
  );
};

export const ControlBar = ({
  currentTime,
  totalTime,
  setCurrentTime,
  setStartTime,
  isPlaying,
  setIsPlaying,
}) => {
  return (
    <div className="contor-bar">
      <ProgressBar
        currentTime={currentTime}
        totalTime={totalTime}
        setCurrentTime={setCurrentTime}
        setStartTime={setStartTime}
        isPlaying={isPlaying}
        setIsPlaying={setIsPlaying}
      />
      <ButtonsBar
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
