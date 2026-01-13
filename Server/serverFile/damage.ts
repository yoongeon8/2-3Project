import type { SpellJson } from "../src/tsFile/spellType";

export const playerHp = 10000;

export const Enemy = [
    {name: "임진하&김윤지 선생님", hp: 50000, normalAttack: 10000, hardAttack: 20000},
    {name: "교장선생님", hp: 75000, normalAttack: 22000, hardAttack: 28000},
    {name: "성래선생님", hp: 70000, normalAttack: 20000, hardAttack: 25000}
]

//최종 판정 함수
export function createSpellJson(
    target: string,
    result: string,
    volume: number
): SpellJson {

// 정확도 계산 함수
function accuracyPercent(target: string, result: string): number {
    if (!target || !result) return 0;
    const minLen = Math.min(target.length, result.length);
    let same = 0;

    for (let i = 0; i < minLen; i++) {
        if (target[i] === result[i]) same++;
    }

    return (same / target.length) * 100;
}
  
  //단어 정확도 계산 함수
function wordAccuracy(target: string, result: string): number {
    const tWords = target.trim().split(/\s+/);
    const rWords = result.trim().split(/\s+/);
    let same = 0;

    tWords.forEach((w, i) => {
        if (rWords[i] === w) same++;
    });

    return (same / tWords.length) * 100;
}

    const charScore = accuracyPercent(target, result);
    const wordScore = wordAccuracy(target, result);
    const finalScore = Math.round(charScore * 0.6 + wordScore * 0.4);

    let firstJudge: "성공" | "실패" = "실패";
    let secondJudge: "성공" | "미흡"| "실패" = "실패";
    let damage = 0;

    if(finalScore >= 50){
        firstJudge = "성공";
        if(volume >= 10 && volume <= 30){
            secondJudge = "성공";
            damage = 15000;
        }else if(volume >= 3 && volume <= 9){
            secondJudge = "미흡";
            damage = 10000;
        }
    }
    else{
        damage = 0;
    }
  
    return {
      target,
      result,
      finalScore,
      firstJudge,
      secondJudge,
      decibel: volume,
      damage
    };
  }