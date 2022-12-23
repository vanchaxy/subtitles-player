import { useEffect, useRef, useState, memo } from "react";
import AutoSizer from "react-virtualized-auto-sizer";
import { Virtuoso } from "react-virtuoso";
import { Popover } from "react-tiny-popover";
import { MdSync, MdSyncDisabled } from "react-icons/md";

export const SubtitlesContainer = memo(
  ({
    subtitles,
    followSubtitles,
    setFollowSubtitles,
    currentSubIndex,
    sentences,
  }) => {
    const [popupIndex, setPopupIndex] = useState();
    const [popupWordIndex, setPopupWordIndex] = useState();
    const [popupTranslate, setPopupTranslate] = useState();
    const [popupTranslateType, setPopupTranslateType] = useState("w");
    const [followBeforePopup, setFollowBeforePopup] = useState();

    const subtitlesListRef = useRef();

    useEffect(() => {
      if (followSubtitles && subtitlesListRef.current !== undefined)
        subtitlesListRef.current.scrollToIndex({
          index: currentSubIndex,
          align: "center",
        });
    }, [followSubtitles, currentSubIndex]);

    useEffect(() => {
      if (subtitlesListRef.current !== undefined)
        subtitlesListRef.current.scrollToIndex({ index: 0, align: "center" });
    }, [subtitles]);

    const translate = (query, resultCallback) => {
      fetch(
        "https://translation.googleapis.com/language/translate/v2?key=AIzaSyCE_Uq1aMsVYjvY1f4hkNZGcxq-CFk6UTs",
        {
          method: "POST",
          body: JSON.stringify({
            q: query,
            source: "en",
            target: "uk",
            format: "text",
          }),
        }
      )
        .then((response) => response.json())
        .then((js) => resultCallback(js.data.translations[0].translatedText));
    };

    const renderSub = (index) => {
      return (
        <div
          key={index}
          className={
            index === currentSubIndex ? "current subtitle" : "subtitle"
          }
        >
          {subtitles.at(index).segments.map((s, i) => (
            <Popover
              isOpen={index === popupIndex && i === popupWordIndex}
              positions={["top", "bottom"]}
              content={() => (
                <div className="sutitle-translation">{popupTranslate}</div>
              )}
              onClickOutside={() => {
                setPopupIndex(null);
                setPopupWordIndex(null);
                setFollowSubtitles(followBeforePopup);
              }}
            >
              {s.isWordLike ? (
                <span
                  key={i}
                  className={
                    popupIndex === index && popupWordIndex === i
                      ? "current word"
                      : "word"
                  }
                  onClick={(e) => {
                    if (popupIndex === index && popupWordIndex === i) {
                      if (popupTranslateType === "w") {
                        translate(sentences[s.sentenceIndex].segment, (res) => {
                          setPopupTranslateType("s");
                          setPopupTranslate(res);
                        });
                        return;
                      }
                      setPopupIndex(null);
                      setPopupWordIndex(null);
                      setFollowSubtitles(followBeforePopup);
                      return;
                    }
                    translate(s.segment, (res) => {
                      setPopupTranslateType("w");
                      setPopupTranslate(res);
                      setPopupIndex(index);
                      setPopupWordIndex(i);
                      setFollowBeforePopup(followSubtitles);
                      setFollowSubtitles(false);
                    });
                  }}
                >
                  {s.segment}
                </span>
              ) : (
                <span key={i}>{s.segment}</span>
              )}
            </Popover>
          ))}
        </div>
      );
    };

    const toggleFollow = () => {
      if (followSubtitles) {
        setFollowSubtitles(false);
      } else {
        setFollowSubtitles(true);
        subtitlesListRef.current.scrollToIndex({
          index: currentSubIndex,
          align: "center",
        });
      }
    };

    return (
      <div className="subtitles-container">
        <AutoSizer>
          {({ height, width }) => (
            <Virtuoso
              className="no-scrollbars"
              ref={subtitlesListRef}
              style={{
                height: height,
                width: width,
              }}
              totalCount={subtitles.length}
              itemContent={renderSub}
            />
          )}
        </AutoSizer>
        <button
          className="follow-btn"
          disabled={popupWordIndex}
          onClick={toggleFollow}
        >
          {followSubtitles ? <MdSyncDisabled /> : <MdSync />}
        </button>
      </div>
    );
  }
);
