import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { createGlobalStyle } from 'styled-components';

// --- 이미지 Import (경로: ../assets) ---
import background4 from '../assets/background4.png';      // 평소 교장실
import background4_1 from '../assets/background4-1.png';  // 폭파된 교장실

import playerImg from '../assets/player-start-1.png';
import playerProfileImg from '../assets/player-start-profile.png';

// 교장선생님 이미지
import npc4_1 from '../assets/npc4-1.png'; // 평상시
import npc4_2 from '../assets/npc4-2.png'; // 전투 태세
import npc4_3 from '../assets/npc4-3.png'; // 데미지 입음

// 프로필
import npc_profile1 from '../assets/npc-profile1.png'; // 세바스찬
import npc_profile6 from '../assets/npc-profile6.png'; // 교장선생님

// 기타 리소스
import mic from '../assets/mic.png';
import playerbattle1 from '../assets/player-change-1.png'; // 변신 후

//기타 파일 import
import {spells, failMic} from "../../../Server/src/tsFile/spells";
import {useSpeechToText} from "../tsFolder/speech";
import {useVolume} from "../tsFolder/audio";
import {createSpellJson, Enemy} from "../../../Server/serverFile/damage";
import { useNavigate } from 'react-router-dom';

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

  const { transcript, listening, start, stop } = useSpeechToText();
  const playerName = localStorage.getItem("player") ?? "미림이";

  const [step, setStep] = useState(1);
  const [currentLine, setCurrentLine] = useState(0); // 대화 번호
  const [battlePhase, setBattlePhase] = useState<'intro' | 'idle' | 'attack' | 'processing'>('intro');
  const [targetSpell, setTargetSpell] = useState("치링치링 샤랄라 나날이 예뻐지는 나. 너무나도 소중해");
  const [gameState, setGameState] = useState<'playing' | 'victory_end' | 'defeat_end'>('playing'); 
  const [battleText, setBattleText] = useState<string | null>(null);

  //상태 설정
  const [isTransformed, setIsTransformed] = useState(false);
  const [isExploded, setIsExploded] = useState(false);

  // HP 설정
  const PLAYER_MAX = 100000;
  const ENEMY_MAX = 75000;

  const [playerHp, setPlayerHp] = useState(PLAYER_MAX);
  const [enemyHp, setEnemyHp] = useState(ENEMY_MAX);

  const [isHit, setIsHit] = useState(false);

  const playerHpPercent = (playerHp / PLAYER_MAX) * 100;
  const enemyHpPercent = (enemyHp / ENEMY_MAX) * 100;

  const playerAttackLines = spells;

  // 대사 데이터
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
    // 전투 시작
    { speaker: 'sebaschan', situation: 'battle', text: '미림아 확실히 교장선생님이셔서 그런지 힘이 남달라! 이길 수 있어!'},
    // 전투 중 (HUD 표시)
    { speaker: 'system', situation: 'battle_intro', text: '(전투 진행 중...)' },
    // 승리
    { speaker: 'principal', situation: 'victory', text: '당신이 폭파시키고 싶다면.. 그게 학교의 운명이겠죠' },
    { speaker: 'sebaschan', situation: 'victory', text: '좋았어 이제 학교를 폭파 시킬 수 있어!' },
    { speaker: 'sebaschan', situation: 'victory', text: '고생했어 미림아! 이제 마법으로 학교를 폭파 시킬 수 있어' },
    { speaker: 'player', situation: 'victory', text: '좋았어 학교를 폭파 시키자!' },
    { speaker: 'system', situation: 'explode', text: '이제 학교는 미림이의 의해서 폭파되었다. 그렇다... 미림이와 세바스찬은 자신들의 꿈을 이뤘다' },
    // 패배
    { speaker: 'system', situation: 'defeat', text: '미림이의 변신이 풀린다' },
    { speaker: 'principal', situation: 'defeat', text: '미림학생의 자리는 이곳이 아닙니다 돌아가세요' },
    { speaker: 'principal', situation: 'defeat', text: '이 힘은 가져가도록 하겠습니다' },
  ];
;


  const speakerConfig = {
    player: { name: playerName, profile: playerProfileImg },
    principal: { name: '교장선생님', profile: npc_profile6 },
    sebaschan: { name: '세바스찬', profile: npc_profile1 },
    system: { name: '', profile: null },
    battle: { name: '', profile: null },
  }as const;

  type SpeakerKey = keyof typeof speakerConfig

  const currentDialogue = dialogues[currentLine];
  const isSpeak = currentDialogue.situation === 'speak';
  const isBattle = currentDialogue.situation === 'battle';
  const [battleLine, setBattleLine] = useState('');


  const showMic = (isSpeak || isBattle) && battlePhase === "attack";
  const showDialogueBox = true;
  
  const isSavingRef = useRef(false);

  const volume = useVolume(showMic);
  const enemy = Enemy.find(e => e.name === speakerConfig.principal.name);

  const getRandomBattleLine = () => {
    const random =
      failMic[
        Math.floor(Math.random() * failMic.length)
      ];
    setBattleLine(random);
  };

  if(!currentDialogue) return null;
  const currentSpeaker = speakerConfig[currentDialogue.speaker];

  const isSystemMsg = currentDialogue.speaker === 'system';
  const displayPlayer = isTransformed ? playerbattle1 : playerImg;
  const currentBackground = isExploded ? background4_1 : background4;

  useEffect(() => {
    const timer = setTimeout(() => {
      setStep(2);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isBattle) {
      getRandomBattleLine();
    }
  }, [isBattle]);

  useEffect(() => {
    if (isBattle) {
      // 1. 승리 또는 패배 조건 확인
      const isVictory = enemyHp <= 0;
      const isDefeat = playerHp <= 0;

      if (isVictory || isDefeat) {
        // 중복 저장 방지
        if (isSavingRef.current) return;
        isSavingRef.current = true;

        // 서버에 HP 저장 함수 호출
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
    }
  }, [enemyHp, playerHp, isBattle]);

const saveBattleResult = async (hp: number) => {
  try {
    const res = await fetch("http://localhost:3000/attack", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: speakerConfig.principal,
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

  useEffect(() => {
    if (isBattle) {
      if (enemyHp <= 0) {
        // 적 체력이 0일 때: 'victory' 상황의 첫 번째 대사 인덱스 찾기
        const victoryIdx = dialogues.findIndex(d => d.situation === 'victory');
        if (victoryIdx !== -1) setCurrentLine(victoryIdx);
        setBattlePhase('idle'); // 배틀 페이즈 초기화
      } else if (playerHp <= 0) {
        // 플레이어 체력이 0일 때: 'defeat' 상황의 첫 번째 대사 인덱스 찾기
        const defeatIdx = dialogues.findIndex(d => d.situation === 'defeat');
        if (defeatIdx !== -1) setCurrentLine(defeatIdx);
        setBattlePhase('idle');
      }
    }
  }, [enemyHp, playerHp, isBattle]);

  
  const isRecordingRef = useRef(false);

  useEffect(() => {
    if (!showMic) {
      isRecordingRef.current = false;
      return;
    }
    
    if (isRecordingRef.current) return; // 이미 실행 중이면 무시
    
    console.log("마이크 켜짐 - 음성인식 시작");
    isRecordingRef.current = true;
    start();
  }, [showMic]);

  const handleMicClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    console.log("🎤 음성인식 중지 및 로컬 판정 시작");
    stop();

    // 1. transcript 업데이트 대기
    setTimeout(async () => {
      if (!transcript) {
        setBattleText(failMic[Math.floor(Math.random() * failMic.length)]);
        setBattlePhase('idle');
        return;
      }

      // 2. 프론트에서 자체적으로 계산한 데이터 (score, damage 등)
      const localJudge = createSpellJson(targetSpell, transcript, volume);
      
      // 서버에는 검증용으로만 전송
      const data = {
        target: targetSpell,
        transcript: transcript,
        volume: volume
      };

      try {
        setBattlePhase('processing');

        const res = await fetch("http://localhost:3000/voice", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data)
        });
        
        if (res.ok) {
          console.log("✅ 판정 성공: HP 계산 시작");
          
          if (isSpeak) {
            // [변신 단계] 성공 시 바로 다음 대화로
            setIsTransformed(true);
            setCurrentLine(prev => prev + 1);
            setBattlePhase('intro'); 
          } 
          else if (isBattle) {
            // [전투 단계] 프론트에서 직접 HP 감소 로직 실행
            executeBattleTurn(localJudge.damage); 
          }
        } else {
          // 판정 실패 시
          console.log("❌ 판정 실패");
                      
          if (isSpeak) {
            // 변신 실패
            setBattlePhase('idle');
            setBattleText("더 큰 목소리로 정확하게 외쳐야 해!");
          } else if (isBattle) {
            // 전투 실패 - 적 턴
            setBattleText("주문 실패! 적의 공격!");
            
            setTimeout(() => {
              const isHardAttack = Math.random() < 0.1;
              const enemyDamage = isHardAttack ? 25000 : 20000; // 성래쌤 수치
              const attackType = isHardAttack ? "강력한 " : "";
              
              setPlayerHp(prev => Math.max(0, prev - enemyDamage));
              setBattleText(`교장 선생님의 ${attackType}공격! ${enemyDamage}의 피해를 입었다...`);
              
              setBattlePhase('idle');
            }, 1200);
          }
        }
      } catch (err) {
        console.error("❌ 서버 통신 실패:", err);
        setBattlePhase('idle');
      }
    }, 400);
  };

  const executeBattleTurn = (playerDamage: number) => {
    setIsHit(true);
    setEnemyHp(prev => Math.max(0, prev - playerDamage));
    setBattleText(`${playerDamage}의 데미지를 입혔다!`);
  
    setTimeout(() => {
      setIsHit(false);
      
      setEnemyHp(currentEnemyHp => {
        if (currentEnemyHp > 0) {
          // 10% 확률로 강력한 공격
          const isHardAttack = Math.random() < 0.1;
          const enemyDamage = isHardAttack ? 25000 : 20000; // 성래쌤 수치
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


  const handleScreenClick = () => {
    if (gameState !== 'playing') return;
  
    // 1. 마이크가 사라진 상태(idle)에서 화면 클릭 시 마이크 다시 띄우기
    if (battlePhase === 'idle' && (isBattle || isSpeak)) {
      setBattleText(null);
      setBattlePhase('attack'); // 마이크 다시 보임
      if (isBattle) getRandomBattleLine();
      return;
    }
  
    // 2. 현재 마이크가 떠 있는 상태(attack)나 처리 중(processing)이면 클릭 무시
    if (battlePhase === 'attack' || battlePhase === 'processing') {
      return;
    }
  
    // 3. 일반 대화 넘기기
    if (currentLine < dialogues.length - 1) {
      const nextLine = currentLine + 1;
      setCurrentLine(nextLine);
      
      const nextSituation = dialogues[nextLine].situation;
      // 다음 대사가 마법을 외쳐야 하는 상황이면 바로 마이크 띄우기
      if (nextSituation === 'battle' || nextSituation === 'speak') {
        setBattlePhase('attack');
      } else {
        setBattlePhase('intro'); // 일반 대화는 intro나 별도 상태로
      }
    } else {
      setTimeout(async () => {
        const data = {
          name: playerName,
          enemy: speakerConfig.principal.name,
          hp: playerHp
        };
        const result = await fetch("http://localhost:3000/attack", {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify(data)
        });
  
        if(result.ok){
          const calcRank = await fetch("http://localhost:3000/calc/ranking", {
            method: "POST"
          });
          navigate("/rank");
        }
      }, 1000);
    }
  };


  // [이미지 로직]
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

      {/* [수정됨] 패배 엔딩 화면 */}
      {gameState === 'defeat_end' && (
        <EndingScreen>
          <EndingTitle>END</EndingTitle>
          <EndingButton onClick={() => navigate("/")}>처음으로 돌아가기</EndingButton>
        </EndingScreen>
      )}

      {/* [수정됨] 승리 엔딩 화면 */}
      {gameState === 'victory_end' && (
        <EndingScreen>
          <EndingTitle>END</EndingTitle>
          <EndingButton onClick={() => navigate("/")}>처음으로 돌아가기</EndingButton>
        </EndingScreen>
      )}

      {/* HUD */}
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
              <div style={{width: '100%', height:'100%', display:'flex', justifyContent:'flex-end'}}>
                <HpFill $hp={(playerHp / PLAYER_MAX) * 100} />
              </div>
            </HpBarBg>
          </HpBarWrapper>
        </BattleHUD>
      )}

      {/* NPC 렌더링 */}
      {!isExploded && (
        <NpcCharacter src={displayNpc} alt="Principal" />
      )}

      {/* 플레이어 렌더링 */}
      {!isExploded && (
        <StandingCharacter src={displayPlayer} alt="Mirim" />
      )}

      {/* 마이크 */}
      {showMic && <SpeakOverlay />}
      {showMic && (
        <SpeakMicWrapper onClick={handleMicClick}>
          <PulseRing />
          <MicCircle>
            <img src={mic} alt="Attack" width="80" />
          </MicCircle>
        </SpeakMicWrapper>
      )}

      {/* 대화창 - 마이크 켜질 때도 항상 표시 */}
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
              ? (battleText || battleLine || currentDialogue.text)
              : currentDialogue.text
            }
          </DialogueText>
        </MessageBox>
      </DialogueSection>
    )}
    </Container>
  );
};

export default PrincipalPage;