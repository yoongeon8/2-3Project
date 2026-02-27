// useSpeechToText.ts
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
      alert("이 브라우저는 음성인식을 지원하지 않습니다. Chrome 데스크톱을 이용해주세요.");
      return;
    }
    
    // ✅ HTTPS 체크 추가
    if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
      alert("음성 인식은 HTTPS 환경에서만 작동합니다.");
      return;
    }
    
    if (listening) return;

    resetTranscript();
    
    try {
      SpeechRecognition.startListening({
        language: "ko-KR",
        continuous: true,
        interimResults: true  // ✅ true로 변경
      });
    } catch (error) {
      console.error("음성 인식 시작 실패:", error);
      alert("음성 인식을 시작할 수 없습니다. 마이크 권한을 확인해주세요.");
    }
  };

  const stop = async () => {
    if (!listening) return;
    try {
      await SpeechRecognition.stopListening();
    } catch (error) {
      console.error("음성 인식 중지 실패:", error);
    }
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