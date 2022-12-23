import parse from "html-react-parser";
import srtParser2 from "srt-parser-2";
import { FaFileUpload } from "react-icons/fa";
import { useState } from "react";

export const SubtitlesSelector = ({ updateSubtitles, setSentences }) => {
  const [fileName, setFileName] = useState();

  const extractWords = (html) => {
    if (typeof html === "string") {
      return html;
    }
    if (Array.isArray(html)) {
      return html.map((c) => extractWords(c)).join("");
    }
    return extractWords(html.props.children);
  };

  const processSubtitles = (subtitles) => {
    const sentenceSegmenter = new Intl.Segmenter("en", {
      granularity: "sentence",
    });

    let fullText = "";
    let text;
    let sub;
    for (let i = 0; i < subtitles.length; i++) {
      sub = subtitles[i];
      sub.raw = sub.text.valueOf();

      text = sub.text;
      text = text.replace(/{\\a.?\d+}/i, "");

      text = text.replace("{b}", "<b>");
      text = text.replace("{/b}", "</b>");
      text = text.replace("{i}", "<i>");
      text = text.replace("{/i}", "</i>");
      text = text.replace("{u}", "<u>");
      text = text.replace("{/u}", "</u>");

      text = extractWords(parse(text)).replaceAll("\n", " ");
      sub.text = text;
      fullText = fullText + text + " ";
    }

    const sentences = Array.from(sentenceSegmenter.segment(fullText), (s) => ({
      segment: s.segment,
      offset: s.index,
    }));

    const wordSegmenter = new Intl.Segmenter("en", { granularity: "word" });
    let subtitleOffset = 0;
    let sentenceIndex = 0;
    for (let i = 0; i < subtitles.length; i++) {
      sub = subtitles[i];
      sub.segments = [];
      let segments = Array.from(wordSegmenter.segment(sub.text));
      for (let j = 0; j < segments.length; j++) {
        if (
          sentenceIndex + 1 !== sentences.length &&
          sentences[sentenceIndex + 1].offset ===
            subtitleOffset + segments[j].index
        )
          sentenceIndex++;
        sub.segments.push({
          segment: segments[j].segment,
          isWordLike: segments[j].isWordLike,
          sentenceIndex: sentenceIndex,
        });
      }
      subtitleOffset = subtitleOffset + sub.text.length + 1;
    }

    updateSubtitles(subtitles);
    setSentences(sentences);
  };

  const onFileChange = (event) => {
    setFileName(event.target.files[0].name);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target.result;
      const parser = new srtParser2();
      let subtitles = parser.fromSrt(text);
      processSubtitles(subtitles);
    };
    reader.readAsText(event.target.files[0]);
  };

  return (
    <div className="subtitles-selector">
      <label for="file-upload" class="file-upload">
        <FaFileUpload />
      </label>
      <input id="file-upload" type="file" onChange={onFileChange} />
      <div className="file-name">{fileName}</div>
    </div>
  );
};
