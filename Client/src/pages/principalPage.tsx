import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { createGlobalStyle } from 'styled-components';

// --- background img
import background4 from '../assets/background4.png';
import background4_1 from '../assets/background4-1.png';

//person img
import playerImg from '../assets/player-start-1.png';
import playerProfileImg from '../assets/player-start-profile.png';
import npc4_1 from '../assets/npc4-1.png'; // normal
import npc4_2 from '../assets/npc4-2.png'; // fight
import npc4_3 from '../assets/npc4-3.png'; // is demage

// 프로필
import npc_profile1 from '../assets/npc-profile1.png'; // 세바스찬
import npc_profile6 from '../assets/npc-profile6.png'; // 교장선생님

// 기타 리소스
import mic from '../assets/mic.png';
import playerbattle1 from '../assets/player-change-1.png'; // 변신 후

//function
import {spells, failMic} from "../../../Server/src/tsFile/spells";
import {useSpeechToText} from "../tsFolder/speech";
import {useVolume} from "../tsFolder/audio";
import {createSpellJson, Enemy} from "../../../Server/serverFile/damage";
import { useNavigate } from 'react-router-dom';
import { SERVER_URL } from './gardenPage';

// --- 스타일 정의 ---
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

const shake = keyframes`
  0% { transform: translate(1px, 1px) rotate(0deg); }
  10% { transform: translate(-1px, -2px) rotate(-1deg); }
  20% { transform: translate(-3px, 0px) rotate(1deg); }
  30% { transform: translate(3px, 2px) rotate(0deg); }
  40% { transform: translate(1px, -1px) rotate(1deg); }
  50% { transform: translate(-1px, 2px) rotate(-1deg); }
  60% { transform: translate(-3px, 1px) rotate(0deg); }
  70% { transform: translate(3px, 1px) rotate(-1deg); }
  80% { transform: translate(-1px, -1px) rotate(1deg); }
  90% { transform: translate(1px, 2px) rotate(0deg); }
  100% { transform: translate(1px, -2px) rotate(-1deg); }
`;

const pulse = keyframes`
  0% { transform: scale(0.3); opacity: 0.8; }
  100% { transform: scale(2.5); opacity: 0; }
`;

const Container = styled.div<{ $bg: string; $isExploded: boolean }>`
  width: 100vw;
  height: 100vh;
  background-image: url(${props => props.$bg});
  background-size: cover;
  background-position: center;
  position: relative;
  overflow: hidden;
  cursor: pointer;

  ${props => props.$isExploded && css`
    animation: ${shake} 0.5s infinite;
  `}
`;

const StandingCharacter = styled.img`
  position: absolute;
  bottom: 0;
  right: 10%;
  height: 85%;
  z-index: 5;
  transition: all 0.3s ease;
`;

const NpcCharacter = styled.img`
  position: absolute;
  bottom: 0;
  left: 10%;
  height: 85%;
  z-index: 4;
`;

// 대화창 관련 스타일
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
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 10px;
`;

const ProfileInner = styled.div`
  width: 100%;
  height: 100%;
  padding: 20px;
  background-color: rgba(255, 255, 255, 0.2);
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
`;

const ProfileImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const MessageBox = styled.div`
  flex-grow: 1;
  background-color: rgba(0, 0, 0, 0.7);
  border: 6px solid;
  border-image-source: linear-gradient(to right, #FFF583, #FF7CF2);
  border-image-slice: 1;
  padding: 30px;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const NameTag = styled.div`
  position: absolute;
  top: -70px;
  left: 0;
  color: #FF27AC;
  -webkit-text-stroke: 2px #FFF583;
  font-family: "Cafe24 ClassicType";
  font-size: 40px;
`;

const DialogueText = styled.div<{ $speak: boolean }>`
  font-size: 2rem;
  color: ${({ $speak }) => ($speak ? '#FFF583' : 'white')};
  font-family: "Cafe24 ClassicType";
  line-height: 1.4;
`;

// 전투 HUD
const BattleHUD = styled.div`
  position: absolute;
  top: 20px;
  width: 100%;
  display: flex;
  justify-content: space-between;
  padding: 0 100px;
  z-index: 30;
`;

const HpBarWrapper = styled.div`
  width: 400px;
`;

const HpName = styled.div`
  color: white;
  font-size: 1.5rem;
  font-family: 'Cafe24 ClassicType';
  margin-bottom: 5px;
  text-shadow: 2px 2px 4px black;
`;

const HpBarBg = styled.div`
  width: 100%;
  height: 30px;
  background: white;
  border: 3px solid black;
`;

const HpFill = styled.div<{ $hp: number; $isEnemy?: boolean }>`
  width: ${({ $hp }) => $hp}%;
  height: 100%;
  background: ${({ $isEnemy }) => 
    $isEnemy 
      ? 'linear-gradient(90deg, #FF6344, #FFF583)' 
      : 'linear-gradient(90deg, #FF9D8C, #FC33A9)'};
  transition: width 0.3s ease;
`;

// 마이크/공격 오버레이
const SpeakOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 15;
  pointer-events: none;
`;

const SpeakMicWrapper = styled.div`
  position: absolute;
  top: 20%;
  left: 50%;
  transform: translateX(-50%);
  width: 150px;
  height: 150px;
  z-index: 20;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const PulseRing = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: rgba(255, 105, 180, 0.4);
  animation: ${pulse} 1.6s ease-out infinite;
`;

const MicCircle = styled.div`
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background: linear-gradient(180deg, #FF9A3B, #FF27AC);
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 0 25px rgba(255, 0, 150, 0.8);
`;

// [수정된 엔딩 화면 스타일]
const EndingScreen = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.7); // 화면 어둡게 통일
  z-index: 100;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  // animation: fadein ... 제거 (애니메이션 없음)
`;

const EndingTitle = styled.h1`
  font-size: 5rem;
  color: white;
  margin-bottom: 40px;
  font-family: 'Cafe24 ClassicType';
`;

const EndingButton = styled.button`
  width: 421px;
  height: 96px;
  display: flex;
  justify-content: center;
  align-items: center;
  
  font-size: 2rem;
  font-family: 'Cafe24 ClassicType';
  
  // 핑크색 버튼 스타일
  background: #FFC0CB; 
  color: #FF27AC; 
  
  border: none;
  border-radius: 50px;
  cursor: pointer;
  transition: transform 0.2s;
  box-shadow: 0 5px 15px rgba(0,0,0,0.3);

  &:hover {
    transform: scale(1.05);
  }
`;

// --- 메인 컴포넌트 ---
const PrincipalPage = () => {
  const navigate = useNavigate();

  const { transcript, listening, start, stop, resetTranscript } = useSpeechToText();
  const playerName = localStorage.getItem("player") ?? "미림이";

  const EnemyData = Enemy;

  const [step, setStep] = useState(1);
  const [currentLine, setCurrentLine] = useState(0);
  const [battlePhase, setBattlePhase] = useState<'intro' | 'idle' | 'attack' | 'processing' | 'failed'>('intro'); // ✅ 'failed' 추가
  const [targetSpell, setTargetSpell] = useState("치링치링 샤랄라 나날이 예뻐지는 나. 너무나도 소중해");
  const [gameState, setGameState] = useState<'playing' | 'victory_end' | 'defeat_end'>('playing');
  const [battleText, setBattleText] = useState<string | null>(null);

  const [isTransformed, setIsTransformed] = useState(false);
  const [isExploded, setIsExploded] = useState(false);

  const dialogues: {
    speaker: SpeakerKey,
    situation: string,
    text: string;
  }[] = [
    { speaker: 'system', situation: 'story', text: '교장실로 이동한다.' },
    { speaker: 'principal', situation: 'story', text: '어? 미림 학생 아닌가요? 이곳까지 올 줄은 몰랐네요.' },
    { speaker: 'player', situation: 'story', text: '저도요. 전 이제 멈출 생각이 없습니다.' },
    { speaker: 'principal', situation: 'story', text: '지금이라도 돌아가면 아무 일도 없던 걸로 하겠습니다.' },
    { speaker: 'sebaschan', situation: 'story', text: '미림아 변신하자!' },
    { speaker: 'player', situation: 'speak', text: "치링치링 샤랄라 나날이 예뻐지는 나. 너무나도 소중해!" },
    { speaker: 'sebaschan', situation: 'battle', text: '미림아 확실히 교장선생님이셔서 그런지 힘이 남달라! 이길 수 있어!' },
    { speaker: 'system', situation: 'battle_intro', text: '(전투 진행 중...)' },
    { speaker: 'principal', situation: 'victory', text: '당신이 폭파시키고 싶다면.. 그게 학교의 운명이겠죠' },
    { speaker: 'sebaschan', situation: 'victory', text: '좋았어 이제 학교를 폭파 시킬 수 있어!' },
    { speaker: 'sebaschan', situation: 'victory', text: '고생했어 미림아! 이제 마법으로 학교를 폭파 시킬 수 있어' },
    { speaker: 'player', situation: 'victory', text: '좋았어 학교를 폭파 시키자!' },
    { speaker: 'system', situation: 'explode', text: '이제 학교는 미림이의 의해서 폭파되었다. 그렇다... 미림이와 세바스찬은 자신들의 꿈을 이뤘다' },
    { speaker: 'system', situation: 'defeat', text: '미림이의 변신이 풀린다' },
    { speaker: 'principal', situation: 'defeat', text: '미림학생의 자리는 이곳이 아닙니다 돌아가세요' },
    { speaker: 'principal', situation: 'defeat', text: '이 힘은 가져가도록 하겠습니다' },
  ];

  const speakerConfig = {
    player: { name: playerName, profile: playerProfileImg },
    principal: { name: '교장선생님', profile: npc_profile6 },
    sebaschan: { name: '세바스찬', profile: npc_profile1 },
    system: { name: '', profile: null },
    battle: { name: '', profile: null },
  } as const;

  type SpeakerKey = keyof typeof speakerConfig;

  const PLAYER_MAX = 100000;
  const ENEMY_MAX = EnemyData.find(enemy => enemy.name === speakerConfig.principal.name)?.hp ?? 75000;

  const [playerHp, setPlayerHp] = useState(PLAYER_MAX);
  const [enemyHp, setEnemyHp] = useState(ENEMY_MAX);

  const [isHit, setIsHit] = useState(false);

  const playerHpPercent = (playerHp / PLAYER_MAX) * 100;
  const enemyHpPercent = (enemyHp / ENEMY_MAX) * 100;

  const playerAttackLines = spells;

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

  const enemy = Enemy.find(e => e.name === speakerConfig.principal.name);

  const getRandomBattleLine = () => {
    const random = playerAttackLines[Math.floor(Math.random() * playerAttackLines.length)];
    setBattleLine(random);
    setTargetSpell(random); // ✅ 타겟 스펠도 업데이트
  };

  if (!currentDialogue) return null;
  const currentSpeaker = speakerConfig[currentDialogue.speaker];

  const isSystemMsg = currentDialogue.speaker === 'system';
  const displayPlayer = isTransformed ? playerbattle1 : playerImg;
  const currentBackground = isExploded ? background4_1 : background4;

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
          name: playerName, // ✅ 수정
          enemy: speakerConfig.principal.name,
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
          const isHardAttack = Math.random() < 0.1;
          const enemyDamage = isHardAttack ? (enemy?.hardAttack || 28000) : (enemy?.normalAttack || 22000);
          const attackType = isHardAttack ? "강력한 " : "";

          setPlayerHp(prev => Math.max(0, prev - enemyDamage));
          setBattleText(`교장 선생님의 ${attackType}공격! ${enemyDamage}의 피해를 입었다...`);
        } else {
          setBattleText("교장 선생님을 쓰러뜨렸다!");
        }
        return currentEnemyHp;
      });

      setBattlePhase('idle');
    }, 1200);
  };

  // ✅ 화면 클릭 핸들러
  const handleScreenClick = async () => {
    if (gameState !== 'playing') return;

    // ✅ 실패 상태에서 클릭하면 다시 idle로 전환 (재시도)
    if (battlePhase === 'failed' && (isSpeak || isBattle)) {
      setEnemyHp(currentEnemyHp => {
        if (currentEnemyHp > 0) {
          const enemy = Enemy.find(e => e.name === speakerConfig.principal.name);
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
        setBattlePhase('idle');
      } else {
        setBattlePhase('intro');
      }
    } else {
      try {
        setBattlePhase('processing'); // 로딩 상태 시작
  
        const data = {
          name: playerName,
          enemy: speakerConfig.principal.name,
          hp: playerHp
        };
  
        // 공격 결과 저장
        const attackRes = await fetch(`${SERVER_URL}/attack`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data)
        });
  
        if (attackRes.ok) {
          // 랭킹 계산
          console.log("공격 저장 완료, 랭킹 계산 중...");
          const calcRes = await fetch(`${SERVER_URL}/calc/ranking`, {
            method: "POST"
          });
  
          if (calcRes.ok) {
            setTimeout(() => navigate("/rank"), 1000);
          } else {
            throw new Error("랭킹 계산에 실패했습니다.");
          }
        } else {
          throw new Error("공격 데이터 저장에 실패했습니다.");
        }
  
      } catch (error) {
        console.error("Error:", error);
        alert(error instanceof Error ? error.message : "알 수 없는 오류 발생");
      }
    }
  };

  // 이미지 로직
  let displayNpc = npc4_1;
  if (isHit) {
    displayNpc = npc4_3;
  } else if (isBattle) {
    displayNpc = npc4_2;
  }

  return (
    <Container
      $bg={currentBackground}
      $isExploded={isExploded}
      onClick={handleScreenClick}
    >
      <GlobalStyle />

      {gameState === 'defeat_end' && (
        <EndingScreen>
          <EndingTitle>END</EndingTitle>
          <EndingButton onClick={() => navigate("/")}>처음으로 돌아가기</EndingButton>
        </EndingScreen>
      )}

      {gameState === 'victory_end' && (
        <EndingScreen>
          <EndingTitle>END</EndingTitle>
          <EndingButton onClick={() => navigate("/")}>처음으로 돌아가기</EndingButton>
        </EndingScreen>
      )}

      {isBattle && (
        <BattleHUD>
          <HpBarWrapper>
            <HpName>교장선생님</HpName>
            <HpBarBg>
              <HpFill $hp={(enemyHp / ENEMY_MAX) * 100} $isEnemy={true} />
            </HpBarBg>
          </HpBarWrapper>
          <HpBarWrapper style={{ textAlign: 'right' }}>
            <HpName>미림이</HpName>
            <HpBarBg>
              <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'flex-end' }}>
                <HpFill $hp={(playerHp / PLAYER_MAX) * 100} />
              </div>
            </HpBarBg>
          </HpBarWrapper>
        </BattleHUD>
      )}

      {!isExploded && (
        <NpcCharacter src={displayNpc} alt="Principal" />
      )}

      {!isExploded && (
        <StandingCharacter src={displayPlayer} alt="Mirim" />
      )}

      {showMic && <SpeakOverlay />}
      {showMic && (
        <SpeakMicWrapper onClick={handleMicClick}>
          <PulseRing />
          <MicCircle>
            <img src={mic} alt="Attack" width="80" />
          </MicCircle>
        </SpeakMicWrapper>
      )}

      {showDialogueBox && (
        <DialogueSection>
          <ProfileWrapper>
            <ProfileInner>
              <ProfileImage
                src={battleText
                  ? speakerConfig.sebaschan.profile
                  : (currentSpeaker?.profile || speakerConfig.sebaschan.profile)
                }
                alt="Profile"
              />
            </ProfileInner>
          </ProfileWrapper>

          <MessageBox>
            <NameTag>
              {battleText ? speakerConfig.sebaschan.name : currentSpeaker.name}
            </NameTag>
            <DialogueText $speak={showMic}>
              {isBattle
                ? (battlePhase === 'attack' ? battleLine : battleText || currentDialogue.text)
                : (battleText || currentDialogue.text)
              }
            </DialogueText>
          </MessageBox>
        </DialogueSection>
      )}
    </Container>
  );
};

export default PrincipalPage;