import express, { Request, Response } from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import { createSpellJson, Enemy as EnemyData } from "./damage.js";
import db from "./db.js";

const PORT = process.env.PORT || 3000;
const app = express();
app.use(express.json());
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://magicgirl23.netlify.app"
  ],
  credentials: true
}));

interface UserRow {
  id: number;
  name: string;
  hp: number;
}

// 회원가입
app.post("/auth", (req: Request, res: Response) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).send("이름을 입력해주세요!");
  }

  try {
    const nameExists = (name: string): boolean => {
      const stmt = db.prepare(`SELECT 1 FROM users WHERE name = ?`);
      return !!stmt.get(name);
    };

    if (nameExists(name)) {
      res.status(403).send("이미 존재하는 이름입니다.");
    } else {
      db.prepare(`INSERT INTO users (name) VALUES (?)`).run(name);
      res.status(201).send("회원가입이 완료됨!");
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("DB 오류");
  }
});

// 음성 처리
app.post("/voice", (req: Request, res: Response) => {
  const { target, transcript, volume } = req.body;

  console.log("🎤 음성 요청:", { target, transcript, volume });

  if (!target || !transcript) {
    console.error("❌ 필수 데이터 누락:", { target, transcript });
    return res.status(400).json({ 
      success: false, 
      message: "주문 내용이나 인식된 텍스트가 없습니다." 
    });
  }

  if (typeof volume !== 'number' || volume < 0) {
    return res.status(400).json({ 
      success: false, 
      message: "유효한 볼륨 값이 필요합니다." 
    });
  }

  try {
    // ✅ 서버에서 createSpellJson으로 유사도 계산
    const result = createSpellJson(target, transcript, volume);
    
    console.log("📊 계산 결과:", {
      finalScore: result.finalScore,
      firstJudge: result.firstJudge,
      secondJudge: result.secondJudge,
      damage: result.damage
    });

    // ✅ damage.ts의 로직에 따르면:
    // finalScore >= 50 && volume >= 1 이면 성공
    if (result.firstJudge === "성공" && result.damage > 0) {
      res.status(200).json({ 
        success: true, 
        message: "주문 성공!",
        data: result
      });
    } else {
      res.status(403).json({ 
        success: false, 
        message: "주문 실패! 다시 시도해주세요.",
        data: result,
        reason: result.finalScore < 50 
          ? "발음이 정확하지 않습니다" 
          : "소리가 너무 작습니다"
      });
    }
  } catch (err) {
    console.error("❌ 음성 처리 오류:", err);
    res.status(500).json({ 
      success: false, 
      message: "음성 처리 중 오류가 발생했습니다." 
    });
  }
});

// 공격 처리
app.post("/attack", (req: Request, res: Response) => {
  const { name, enemy, hp } = req.body;

  let multiplier = 1;
  switch (enemy) {
    case "임진하&김윤지 선생님":
      multiplier = 1.0;
      break;
    case "박성래 선생님":
      multiplier = 1.2;
      break;
    case "교장선생님":
      multiplier = 1.5;
      break;
    default:
      return res.status(400).json({ success: false, message: "알 수 없는 적" });
  }

  const addedHp = Math.floor(hp * multiplier);
  const now = Date.now();

  try {
    db.prepare(`
      UPDATE users
      SET hp = hp + ?, scoreUpdateAt = ?
      WHERE name = ?
    `).run(addedHp, now, name);

    res.status(200).json({
      success: true,
      message: "hp 및 시간 저장 성공",
      addedHp,
      updatedAt: now
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "hp 저장 실패" });
  }
});

// 랭킹 계산
app.post("/calc/ranking", (_req: Request, res: Response) => {
  try {
    const users = db.prepare(`
      SELECT id, name, hp, scoreUpdateAt
      FROM users
      ORDER BY hp DESC, scoreUpdateAt ASC
    `).all() as UserRow[];

    db.prepare(`DELETE FROM ranking`).run();

    let rank = 0;
    let prevHp: number | null = null;
    const insert = db.prepare(`
      INSERT INTO ranking (userId, name, rank, hp)
      VALUES (?, ?, ?, ?)
    `);

    for (const user of users) {
      if (prevHp === null || user.hp < prevHp) rank++;
      insert.run(user.id, user.name, rank, user.hp);
      prevHp = user.hp;
    }

    res.json({ message: "랭킹 계산 완료" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "랭킹 계산 오류" });
  }
});

// 랭킹 조회
app.get("/ranking", (_req: Request, res: Response) => {
  try {
    const data = db.prepare(`SELECT rank, name, hp FROM ranking ORDER BY rank DESC`).all();
    res.json({ data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "랭킹 조회 오류" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
