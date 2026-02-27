import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";

export const useSpeechToText = () => {
  const {
    transcript,
    listening,
    browserSupportsSpeechRecognition,
    resetTranscript
  } = useSpeechRecognition();

  const start = () => {
    if (!browserSupportsSpeechRecognition) {
      alert("이 브라우저는 음성인식을 지원하지 않습니다. Chrome을 이용해주세요.");
      return;
    }
    if (listening) return;

    resetTranscript();
    SpeechRecognition.startListening({
      language: "ko-KR",
      continuous: true,
      interimResults: true
    });
  };

  const stop = async () => {
    if (!listening) return;
    await SpeechRecognition.stopListening();
  };

  return {
    transcript,
    listening,
    browserSupportsSpeechRecognition,
    start,
    stop,
    resetTranscript
  };
};