//판정 타입
export type FirstJudgeResult = "성공" | "실패";
export type SecondJudgeResult = "성공" | "미흡" | "실패";

export interface SpellJson {
    target: string;
    result: string;
    finalScore: number;
    firstJudge: FirstJudgeResult;
    secondJudge: SecondJudgeResult;
    decibel: number;
    damage: number;
}