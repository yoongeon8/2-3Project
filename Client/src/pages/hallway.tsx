import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styled,{ keyframes } from 'styled-components';

//img
import background3 from '../assets/background3-1.png';
import playerImg from '../assets/player-start-1.png';
import playerProfileImg from '../assets/player-start-profile.png';
import npc3_1 from '../assets/npc3-1.png';
import npc3_2 from '../assets/npc3-2.png';
import npc3_3 from '../assets/npc3-3.png';
import npc_profile1 from '../assets/npc-profile1.png';
import npc_profile5 from '../assets/npc-profile5.png';
import { createGlobalStyle } from 'styled-components';
import mic from '../assets/mic.png';
import playerbattle1 from '../assets/player-change-1.png';
import playerbattle2 from '../assets/player-change-2.png';
import playerbattle3 from '../assets/player-change-3.png';
import background3_2 from '../assets/background3-2.png'

//function
import {spells, failMic} from "../../../Server/src/tsFile/spells";
import {useSpeechToText} from "../tsFolder/speech";
import {useVolume} from "../tsFolder/audio";
import {Enemy, createSpellJson} from "../../../Server/serverFile/damage";
import { SERVER_URL } from './gardenPage';

const GlobalStyle = createGlobalStyle`
  @font-face {
    font-family: 'Cafe24ClassicType';
    src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2210-2@1.0/Cafe24ClassicType-Regular.woff2')
      format('woff2');
    font-weight: normal;
    font-style: normal;
    font-display: swap;
  }
`;

const pulse = keyframes`
  0% {
    transform: scale(0.3);
    opacity: 0.8;
  }
  100% {
    transform: scale(2.5);
    opacity: 0;
  }
`;


  const Container = styled.div<{ $bg: string }>`
    width: 100vw;
    height: 100vh;
    background-image: url(${props => props.$bg});
    background-size: cover;
    background-position: center;
    position: relative;
    overflow: hidden;
    cursor: pointer;
  `;

  const IntroOverlay = styled.div`
    background-color: rgba(0, 0, 0, 0.5);
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  `;

  const IntroText = styled.h1`
    color: white;
    font-size: 3rem;
  `;

  const StandingCharacter = styled.img`
    position: absolute;
    bottom: 0;
    right: 10%;
    height: 85%;
    z-index: 5;
  `;
  const NpcCharacter2 = styled.img`
    position: absolute;
    bottom: 0;
    left: 10%;
    height: 85%;
    z-index: 0;
  `;

  const DialogueSection = styled.div`
    position: absolute;
    bottom: 40px;
    left: 50%;
    transform: translateX(-50%);
    width: 95%;
    display: flex;
    align-items: stretch;
    z-index: 10;
  `;

  const ProfileWrapper = styled.div`
    width: 180px;
    height: 180px;
    border-radius: 5px;
    background: linear-gradient(54deg, #FF7CF2 -28.84%, #FFF583 91.73%);
    padding: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-shrink: 0;
    margin-right: 10px;
    box-sizing: border-box;
  `;

  const ProfileInner = styled.div`
    width: 100%;
    height: 100%;
    padding:20px;
    background-color: rgba(255, 255, 255, 0.2);
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
    box-sizing: border-box; 
  `;

  const ProfileImage = styled.img<{ $scale?: number }>`
    width: 100%;
    height: 100%;
    transform: scale(${props => props.$scale ?? 1});
  `;

  const MessageBox = styled.div<{ $isNarration?: boolean }>`
  flex-grow: 1;
  background-color: rgba(0, 0, 0, 0.2);
  border: 6px solid;
  border-image-source: linear-gradient(to right, #FFF583, #FF7CF2);
  border-image-slice: 1;
  padding: 30px;
  position: relative;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: center;
  
  /* --- 수정 부분: 모든 대사를 중앙으로 --- */
  align-items: center;    /* 자식 요소(DialogueText)를 가로 중앙으로 */
  text-align: center;     /* 텍스트 줄바꿈 시에도 중앙 정렬 */
`;

  const NameTag = styled.div`
    letter-spacing : -0.2rem;
    position: absolute;
    top: -70px;
    left: 0;
    padding: 3px 26px;
    display: flex;
    align-items: center;
    gap: 8px;
    color: #FF27AC;
    -webkit-text-stroke-width: 2px;
    -webkit-text-stroke-color: #FFF583;
    font-family: "Cafe24 ClassicType";
    font-size: 40px;  
    font-style: normal;
    font-weight: 400;
    line-height: normal;

    span {
      color: yellow;
    }
  `;

  const DialogueText = styled.div<{ $speak: boolean }>`
    font-size: ${({ $speak }) =>
      $speak ? '2rem' : '1.5rem'};
    color: ${({ $speak }) =>
      $speak ? '#FFF583' : 'white'};
    line-height: 1.4;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
    font-family: ${({ $speak }) =>
      $speak ? "'Cafe24ClassicType'" : 'inherit'};
  `;
  const SpeakOverlay = styled.div`
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 1;
    pointer-events: none;
  `;
  const MicCircle = styled.div`
    width: 150px;
    height: 150px;
    border-radius: 50%;
    background: linear-gradient(
      180deg,
      #FF9A3B 0%,
      #FF27AC 100%
    );
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 2;
    box-shadow: 0 0 25px rgba(255, 0, 150, 0.8);
  `;

  const MicImage = styled.img`
    width: 80px;
    height: 80px;
  `;
  const PulseRing = styled.div`
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: rgba(255, 105, 180, 0.4);
    animation: ${pulse} 1.6s ease-out infinite;
  `;
  const PulseRingDelay = styled(PulseRing)`
    animation-delay: 0.8s;
  `;

  const SpeakMicWrapper = styled.div`
    position: absolute;
    top: 18%;
    left: 50%;
    transform: translateX(-50%);
    width: 150px;
    height: 150px;
    z-index: 20;
    display: flex;
    justify-content: center;
    align-items: center;
  `;
  const BattleHUD = styled.div`
    position: absolute;
    top: 20px;
    left: 0;
    width: 100%;
    display: flex;
    justify-content: space-center;
    padding: 0 80px; 
    gap:550px;
    z-index: 30;
  `;
  const HpBarWrapper = styled.div`
    width: 360px;
  `;

  const HpName = styled.div`
    color: white;
    font-size: 1.2rem;
    margin-bottom: 6px;
  `;

  const HpBarBg = styled.div`
    width: 100%;
    height: 36px;
    background: #FFF;
    border: 2px solid black;
    overflow: hidden;  
  `;

  const PlayerhpBarFill = styled.div<{ $hp: number }>`
    width: ${({ $hp }) => $hp}%;
    height: 100%;
    background: linear-gradient(90deg, #FF9D8C 0%, #FC33A9 100%);
    transition: width 0.4s ease;
  `;
  const EnemyhpBarFill = styled.div<{ $hp: number }>`
    width: ${({ $hp }) => $hp}%;
    height: 100%;
    background: linear-gradient(90deg, #FF6344 0%, #FFF583 100%);
    transition: width 0.4s ease;
  `;
  const VictorySpecialOverlay = styled.div`
    position: absolute;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    z-index: 100;
    color: white;
    text-align: center;
    font-family: 'Cafe24ClassicType';
  `;

  const VictoryTitle = styled.div`
    font-size: 80px;
    font-weight: bold;
    margin-bottom: 20px;
  `;

  const VictorySubTitle = styled.div`
    font-size: 30px;
  `;

  // --- 스타일 정의 수정 (기존 코드 덮어쓰기) ---

  // 패배 전체 배경 (어두운 정도 유지)
  const DefeatSpecialOverlay = styled.div`
    position: absolute;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    flex-direction: column;
    justify-content: center;
    letter-spacing : -3px;
    align-items: center;
    z-index: 200;
    color: white;
    text-align: center;
  `;

  // "패배" 타이틀 (효과 제거, 더 진하고 선명하게)
  const DefeatTitle = styled.div`
    font-size: 85px; /* 크기 약간 키움 */
    font-weight: 900; /* 훨씬 두껍게 */
    color: #FF1B1B; /* 더 진하고 강렬한 빨간색 */
    margin-bottom: 15px;
  `;

  // "다시 플레이 하시겠습니까?" (깔끔하게 유지)
  const DefeatSubTitle = styled.div`
    font-size: 36px;
    font-weight: bold;
    margin-bottom: 200px; /* 버튼과 간격 넓힘 */
  `;

  // 버튼 컨테이너 (간격 조정)
  const ButtonContainer = styled.div`
    display: flex;
    flex-direction: column; /* 사진처럼 세로로 배치 */
    gap: 25px; /* 버튼 사이 간격 */
    width: 100%;
    align-items: center;
  `;

  // 버튼 공통 스타일 (사진처럼 넓고 납작하게)
  const DefeatButton = styled.button`
    width: 400px; /* 훨씬 넓게 */
    height: 85px; /* 높이는 적당히 */
    font-size: 34px;
    font-weight: bold;
    border: none;
    border-radius: 10px; /* 모서리 둥글기 줄임 */
    cursor: pointer;
    color: white;
    transition: filter 0.2s; /* 클릭 시 밝기 변화 */

  `;

  // '예' 버튼 (사진 같은 분홍색 그라데이션)
  const YesButton = styled(DefeatButton)`
    background: linear-gradient(267deg, #F70492 0.36%, #FF9AD5 100%);
  `;

  // '아니오' 버튼 (사진 같은 붉은색 그라데이션)
  const NoButton = styled(DefeatButton)`
    background: linear-gradient(87deg, #F70492 0%, #FF1B1B 100%);
  `;

  // --- 스타일 정의 수정 끝 ---

  const Hallway = () => {
    const navigate = useNavigate();
  
    const { transcript, listening, start, stop, resetTranscript } = useSpeechToText();
    const playerName = localStorage.getItem("player") ?? "미림이";
  
    const [step, setStep] = useState(1);
    const [currentLine, setCurrentLine] = useState(0);
    const [battlePhase, setBattlePhase] = useState<'intro' | 'idle' | 'attack' | 'processing' | 'failed'>('intro'); // ✅ 'failed' 추가
    const [targetSpell, setTargetSpell] = useState("치링치링 샤랄라 나날이 예뻐지는 나. 너무나도 소중해!");
    const [gameState, setGameState] = useState<'playing' | 'victory_end' | 'defeat_end'>('playing');
    const [battleText, setBattleText] = useState<string | null>(null);
  
    const [isTransformed, setIsTransformed] = useState(false);
  
    const PLAYER_MAX_HP = 100000;
    const ENEMY_MAX_HP = 70000;
  
    const [playerHp, setPlayerHp] = useState(PLAYER_MAX_HP);
    const [enemyHp, setEnemyHp] = useState(ENEMY_MAX_HP);
  
    const [isHit, setIsHit] = useState(false);
  
    const [currentBg, setCurrentBg] = useState(background3);
    const [showVictoryEffect, setShowVictoryEffect] = useState(false);
    const [showDefeatEffect, setShowDefeatEffect] = useState(false);
  
    const playerHpPercent = (playerHp / PLAYER_MAX_HP) * 100;
    const enemyHpPercent = (enemyHp / ENEMY_MAX_HP) * 100;
  
    const playerAttackLines = spells;
  
    const dialogues: {
      speaker: SpeakerKey;
      situation: string;
      text: string;
    }[] = [
      { speaker: 'player', situation: 'story', text: '실습실을 터트렸다..! 이제 교실로 이동하자!' },
      { speaker: 'sebaschan', situation: 'story', text: '좋은 생각이야!' },
      { speaker: 'narration', situation: 'story', text: '교실로 이동 중 담임선생님인 성래쌤과 만났다' },
      { speaker: 'srT', situation: 'story', text: '미림아 너가 실습실을 터트리고 왔다는데 사실이니?' },
      { speaker: 'player', situation: 'story', text: '선생님 전 이 학교를 터트릴 겁니다.' },
      { speaker: 'sebaschan', situation: 'story', text: '미림아.. 저 선생님도 쓰러트려야지 교실을 폭파시킬 수 있을 것 같아.' },
      { speaker: 'player', situation: 'speak', text: '좋아 변신할게. 치링치링 샤랄라 나날이 예뻐지는 나. 너무나도 소중해!' },
      { speaker: 'sebaschan', situation: 'battle', text: '이번엔 방금 선생님들보다 더 강력할 것 같아 조심해' },
      { speaker: 'srT', situation: 'defeat', text: '그냥 교실로 돌아가도록 해요 안그럼 이 학교에서 뼈를 묻게 될거예요' },
      { speaker: 'srT', situation: 'victory', text: '너에게 학교를 폭파시킬 재능이 있네요' },
      { speaker: 'sebaschan', situation: 'victory', text: '좋았어 이제 우린 마지막 최종보스 교장선생님께 가자!' },
    ];
  
    const speakerConfig = {
      player: { name: playerName, profile: playerProfileImg },
      srT: { name: '박성래 선생님', profile: npc_profile5 },
      sebaschan: { name: '세바스찬', profile: npc_profile1 },
      narration: { name: "나레이션", profile: null }
    } as const;
  
    type SpeakerKey = keyof typeof speakerConfig;
  
    const currentDialogue = dialogues[currentLine];
    const isSpeak = currentDialogue?.situation === 'speak';
    const isBattle = currentDialogue?.situation === 'battle';
    const [battleLine, setBattleLine] = useState('');
  
    const showMic = (isSpeak || isBattle) && battlePhase === 'attack';
    const showDialogueBox = true;
  
    const isSavingRef = useRef(false);
    const transcriptRef = useRef("");
  
    // ✅ useVolume에서 객체로 받기
    const volumeData = useVolume(showMic && listening);
  
    const getRandomBattleLine = () => {
      const random = playerAttackLines[Math.floor(Math.random() * playerAttackLines.length)];
      setBattleLine(random);
      setTargetSpell(random); // ✅ 타겟 스펠도 업데이트
    };
  
    if (!currentDialogue) return null;
  
    // ✅ 인트로 타이머
    useEffect(() => {
      const timer = setTimeout(() => {
        setStep(2);
      }, 3000);
      return () => clearTimeout(timer);
    }, []);
  
    // ✅ 배틀 시작 시 랜덤 대사 설정
    useEffect(() => {
      if (isBattle && battlePhase === 'intro') {
        getRandomBattleLine();
      }
    }, [isBattle, battlePhase]);
  
    // ✅ speak/battle 상황이 되면 idle로 전환
    useEffect(() => {
      if (currentDialogue.situation === 'speak' || currentDialogue.situation === 'battle') {
        setBattlePhase('idle');
        setBattleText(null);
      }
    }, [currentLine, currentDialogue.situation]);
  
    // ✅ idle 상태에서 speak/battle 상황이면 자동으로 녹음 시작
    useEffect(() => {
      if (battlePhase === 'idle' && (currentDialogue.situation === 'speak' || currentDialogue.situation === 'battle')) {
        transcriptRef.current = "";
        resetTranscript();
        setBattlePhase('attack');
  
        setTimeout(() => {
          start();
          console.log("🎤 음성 인식 시작");
        }, 300);
      }
    }, [battlePhase, currentDialogue.situation]);
  
    // ✅ transcript 업데이트
    useEffect(() => {
      if (transcript && battlePhase === 'attack') {
        transcriptRef.current = transcript;
        console.log("📝 현재 인식된 내용:", transcript);
      }
    }, [transcript, battlePhase]);
  
    // ✅ 승패 판정 (중복 방지)
    useEffect(() => {
      if (!isBattle) return;
  
      const isVictory = enemyHp <= 0;
      const isDefeat = playerHp <= 0;
  
      if (isVictory || isDefeat) {
        if (isSavingRef.current) return;
        isSavingRef.current = true;
  
        const finalHp = isDefeat ? 0 : playerHp;
        saveBattleResult(finalHp);
  
        if (isVictory) {
          const victoryIdx = dialogues.findIndex(d => d.situation === 'victory');
          if (victoryIdx !== -1) setCurrentLine(victoryIdx);
        } else {
          const defeatIdx = dialogues.findIndex(d => d.situation === 'defeat');
          if (defeatIdx !== -1) setCurrentLine(defeatIdx);
        }
  
        setBattlePhase('idle');
      }
    }, [enemyHp, playerHp, isBattle]);
  
    const saveBattleResult = async (hp: number) => {
      try {
        const res = await fetch(`${SERVER_URL}/attack`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: playerName,
            enemy: speakerConfig.srT.name,
            hp: hp
          })
        });
  
        if (res.ok) {
          console.log("✅ DB에 최종 HP 저장 성공");
        }
      } catch (err) {
        console.error("❌ DB 저장 실패:", err);
      }
    };
  
    // ✅ 마이크 클릭 핸들러
    const handleMicClick = async (e: React.MouseEvent) => {
      e.stopPropagation();
      console.log("🛑 사용자가 마이크 클릭 - 음성 인식 중지");
  
      await stop();
      await handleVoiceEnd();
    };
  
    // ✅ 음성 인식 종료 처리
    const handleVoiceEnd = async () => {
      console.log("🔍 handleVoiceEnd 실행");
  
      const finaltranscript = transcriptRef.current.trim();
  
      if (!finaltranscript) {
        const sebaschanDialogues = failMic[Math.floor(Math.random() * failMic.length)];
        console.log('❌ 인식된 내용이 없습니다.');
        setBattlePhase('failed');
        setBattleText(sebaschanDialogues);
        return;
      }
  
      console.log("🎯 목표 주문:", targetSpell);
      console.log("🗣️ 최종 인식된 주문:", finaltranscript);
      console.log("🔊 볼륨 데이터:", volumeData);
  
      try {
        setBattlePhase('processing');
  
        // ✅ 최대 볼륨 사용
        const volumeToSend = volumeData.max;
  
        const res = await fetch(`${SERVER_URL}/voice`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            target: targetSpell,
            transcript: finaltranscript,
            volume: volumeToSend,
          }),
        });
  
        if (res.ok) {
          console.log("✅ 주문 성공");
  
          // ✅ 로컬에서 데미지 계산
          const localJudge = createSpellJson(targetSpell, finaltranscript, volumeToSend);
  
          if (isSpeak) {
            // 변신 성공
            setIsTransformed(true);
            setCurrentLine(prev => prev + 1);
            setBattlePhase('intro');
            setBattleText(null);
          } else if (isBattle) {
            // 전투 공격
            executeBattleTurn(localJudge.damage);
          }
        } else {
          throw new Error("주문 실패!");
        }
      } catch (err) {
        console.error("❌ 서버 통신 실패:", err);
        const sebaschanDialogues = failMic[Math.floor(Math.random() * failMic.length)];
        setBattlePhase('failed');
        setBattleText(sebaschanDialogues);
      }
    };
  
    // ✅ 전투 턴 실행
    const executeBattleTurn = (playerDamage: number) => {
      // 1. 플레이어 공격
      setIsHit(true);
      setEnemyHp(prev => Math.max(0, prev - playerDamage));
      setBattleText(`${playerDamage}의 데미지를 입혔다!`);
  
      // 2. 적의 반격 (1.2초 뒤)
      setTimeout(() => {
        setIsHit(false);
  
        setEnemyHp(currentEnemyHp => {
          if (currentEnemyHp > 0) {
            const enemy = Enemy.find(e => e.name === speakerConfig.srT.name);
            const isHardAttack = Math.random() < 0.1;
            const enemyDamage = isHardAttack ? (enemy?.hardAttack || 25000) : (enemy?.normalAttack || 20000);
            const attackType = isHardAttack ? "강력한 " : "";
  
            setPlayerHp(prev => Math.max(0, prev - enemyDamage));
            setBattleText(`박성래 선생님의 ${attackType}공격! ${enemyDamage}의 피해를 입었다...`);
          } else {
            setBattleText("박성래 선생님을 쓰러뜨렸다!");
          }
          return currentEnemyHp;
        });
  
        setBattlePhase('idle');
      }, 1200);
    };
  
    // ✅ 화면 클릭 핸들러
    const handleNextDialogue = async () => {
      // 1. 인트로 단계이거나 승리/패배 연출 중에는 클릭 방지
      if (step !== 2 || showVictoryEffect || showDefeatEffect) return;
  
      // 2. 패배 대사 체크
      if (currentDialogue.situation === 'defeat') {
        setShowDefeatEffect(true);
        return;
      }
  
      // 3. 승리 특수 연출 체크
      const isTeachersLastWords =
        currentDialogue.speaker === 'srT' &&
        currentDialogue.situation === 'victory' &&
        currentDialogue.text === '너에게 학교를 폭파시킬 재능이 있네요';
  
      if (isTeachersLastWords) {
        setCurrentBg(background3_2);
        setShowVictoryEffect(true);
  
        setTimeout(() => {
          setShowVictoryEffect(false);
          setCurrentLine(prev => prev + 1);
        }, 2000);
        return;
      }
  
      // ✅ 실패 상태에서 클릭하면 다시 idle로 전환 (재시도)
      if (battlePhase === 'failed' && (isSpeak || isBattle)) {
        console.log("🔄 재시도 - idle 상태로 전환");
        setEnemyHp(currentEnemyHp => {
          if (currentEnemyHp > 0) {
            const enemy = Enemy.find(e => e.name === speakerConfig.srT.name);
            const isHardAttack = Math.random() < 0.1;
            const enemyDamage = isHardAttack ? (enemy?.hardAttack || 0) : (enemy?.normalAttack || 0);
            setPlayerHp(prev => Math.max(0, prev - enemyDamage));
            setBattleText(`선생님들의 공격! ${enemyDamage}의 피해를 입었다...`);
          } else {
            setBattleText("선생님들을 쓰러뜨렸다!");
          }
          return currentEnemyHp;
        });
        setBattlePhase('idle');
        return;
      }
  
      // 공격/프로세싱 중에는 넘기기 불가
      if (battlePhase === 'attack' || battlePhase === 'processing') {
        console.log("⏸️ 음성 인식 중이거나 처리 중입니다.");
        return;
      }
  
      // idle 상태에서 speak/battle이면 마이크 다시 띄우기
      if (battlePhase === 'idle' && (isBattle || isSpeak)) {
        setBattleText(null);
        setBattlePhase('attack');
        if (isBattle) getRandomBattleLine();
        return;
      }
  
      // 일반 대화 넘기기
      if (currentLine < dialogues.length - 1) {
        const nextLine = currentLine + 1;
        setCurrentLine(nextLine);
  
        const nextSituation = dialogues[nextLine].situation;
        if (nextSituation === 'battle' || nextSituation === 'speak') {
          setBattlePhase('idle'); // ✅ idle로 설정하면 자동으로 attack으로 전환
        } else {
          setBattlePhase('intro');
        }
      } else {
        try{
          setBattlePhase('processing');
  
          const data = {
            name: playerName,
            enemy: speakerConfig.srT.name,
            hp: playerHp
          };
  
          const response = await fetch(`${SERVER_URL}/attack`, {
            method: "POST",
            headers: { "Content-Type" : "application/json" },
            body: JSON.stringify(data)
          });
  
          const result = await response.json();
  
          if(response.ok && result.success){
            console.log("저장 성공 : ", result.message);
            setTimeout(() => navigate("/hallway"), 1000); 
          }
        }catch(error){
          console.error("네트워크 오류", error);
          alert("서버와 통신 중 오류가 발생했습니다.");
        }
      }
    };
  
    let displayNpc = npc3_1;
    if (isHit) {
      displayNpc = npc3_3;
    } else if (isBattle) {
      displayNpc = npc3_2;
    }
  
    return (
      <Container $bg={currentBg} onClick={handleNextDialogue}>
        <GlobalStyle />
  
        {isBattle && (
          <BattleHUD>
            <HpBarWrapper style={{ textAlign: 'left' }}>
              <HpBarBg>
                <EnemyhpBarFill $hp={enemyHpPercent} />
              </HpBarBg>
              <HpName>박성래 선생님</HpName>
            </HpBarWrapper>
  
            <HpBarWrapper style={{ textAlign: 'right' }}>
              <HpBarBg>
                <PlayerhpBarFill $hp={playerHpPercent} />
              </HpBarBg>
              <HpName>Player</HpName>
            </HpBarWrapper>
          </BattleHUD>
        )}
  
        {showMic && <SpeakOverlay />}
        {showMic && (
          <SpeakMicWrapper onClick={handleMicClick}>
            <PulseRing />
            <PulseRingDelay />
            <MicCircle>
              <MicImage src={mic} alt="mic" />
            </MicCircle>
          </SpeakMicWrapper>
        )}
  
        {step === 1 && (
          <IntroOverlay>
            <IntroText>4층 복도</IntroText>
          </IntroOverlay>
        )}
  
        {showVictoryEffect && (
          <VictorySpecialOverlay>
            <VictoryTitle>성공</VictoryTitle>
            <VictorySubTitle>복도가 폭파되었다!</VictorySubTitle>
          </VictorySpecialOverlay>
        )}
  
        {showDefeatEffect && (
          <DefeatSpecialOverlay>
            <DefeatTitle>패배</DefeatTitle>
            <DefeatSubTitle>다시 플레이 하시겠습니까?</DefeatSubTitle>
            <ButtonContainer>
              <YesButton onClick={() => window.location.reload()}>예</YesButton>
              <NoButton onClick={() => console.log("종료")}>아니오</NoButton>
            </ButtonContainer>
          </DefeatSpecialOverlay>
        )}
  
        {step === 2 && (
          <>
            <StandingCharacter
              src={isBattle ? playerbattle1 : playerImg}
              alt="Player"
            />
            <NpcCharacter2
              src={displayNpc}
              alt="NPC"
            />
  
            {showDialogueBox && (
              <DialogueSection>
                <ProfileWrapper>
                  <ProfileInner>
                    <ProfileImage
                      src={battleText ? speakerConfig.sebaschan.profile : speakerConfig[currentDialogue.speaker].profile || ''}
                      alt="Profile"
                    />
                  </ProfileInner>
                </ProfileWrapper>
  
                <MessageBox>
                  <NameTag>
                    {battleText ? speakerConfig.sebaschan.name : speakerConfig[currentDialogue.speaker].name}
                  </NameTag>
  
                  <DialogueText $speak={showMic}>
                    {isBattle
                      ? (battlePhase === 'attack' ? battleLine : battleText)
                      : (battleText || currentDialogue.text)
                    }
                  </DialogueText>
                </MessageBox>
              </DialogueSection>
            )}
          </>
        )}
      </Container>
    );
  };
  
  export default Hallway;