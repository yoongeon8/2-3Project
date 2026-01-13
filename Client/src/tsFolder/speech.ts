import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";

export const useSpeechToText = () => {
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
          continuous: false,
          interimResults: false
      });
    };
  
    const stop = () => {
      SpeechRecognition.stopListening();
    };
  
    return {
      transcript,
      listening,
      start,
      stop
    };
  };