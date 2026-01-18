import { useEffect, useRef, useState } from "react";

type SpeechEndCallback = (finalTranscript: string) => void;

export const useSpeechToText = (onSpeechEnd: SpeechEndCallback) => {
  const recognitionRef = useRef<any>(null);
  const transcriptRef = useRef("");
  const [listening, setListening] = useState(false);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.error("SpeechRecognition not supported");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "ko-KR";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event: any) => {
      let text = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        text += event.results[i][0].transcript;
      }
      transcriptRef.current = text;
    };

    recognition.onend = () => {
      console.log("🎤 recognition.onend");
      setListening(false);
      onSpeechEnd(transcriptRef.current.trim());
      transcriptRef.current = "";
    };

    recognitionRef.current = recognition;
  }, [onSpeechEnd]);

  const start = () => {
    if (!recognitionRef.current || listening) return;
    transcriptRef.current = "";
    recognitionRef.current.start();
    setListening(true);
  };

  const stop = () => {
    if (!recognitionRef.current || !listening) return;
    recognitionRef.current.stop(); // → onend 호출됨
  };

  return { listening, start, stop };
};
