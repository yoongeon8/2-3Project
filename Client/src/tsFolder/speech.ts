import SpeechRecognition, {
  useSpeechRecognition
} from "react-speech-recognition";

export const useSpeechToText = (
  onEnd?: (finalTranscript: string) => void
) => {
  const {
    transcript,
    listening,
    browserSupportsSpeechRecognition,
    resetTranscript
  } = useSpeechRecognition();

  const start = () => {
    if (!browserSupportsSpeechRecognition) return;

    resetTranscript();

    SpeechRecognition.startListening({
      language: "ko-KR",
      continuous: true,
      interimResults: false
    });

    // 🔥 중요: start 이후에 recognition을 다시 잡는다
    const recognition = SpeechRecognition.getRecognition();

    if (recognition && onEnd) {
      recognition.onend = () => {
        console.log("🎤 음성 인식 종료됨");
        onEnd(transcript.trim());
      };
    }
  };

  const stop = () => {
    console.log("🛑 stop() 호출");
    SpeechRecognition.stopListening();
  };

  return {
    transcript,
    listening,
    start,
    stop
  };
};