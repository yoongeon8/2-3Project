import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";

export const useSpeechToText = (
  onEnd?: (finalTranscript: string) => void
) => {
    const {
      transcript,
      listening,
      browserSupportsSpeechRecognition,
      resetTranscript
    } = useSpeechRecognition();

    const recognition = SpeechRecognition.getRecognition();
  
    const start = () => {
      if (!browserSupportsSpeechRecognition || !recognition) return;
      resetTranscript();
      recognition.lang = "ko-KR";
      recognition.continuous = false;
      recognition.interimResults = false;
    };
  
    const stop = () => {
      recognition?.stop();
    };

    if(recognition && onEnd){
      recognition.onend = () => {
        onEnd(transcript.trim());
      }
    }
  
    return {
      transcript,
      listening,
      start,
      stop
    };
  };