import express, { Request, Response } from "express";
import cors from "cors";
import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";


import { createSpellJson, Enemy as EnemyData } from "./damage";
import db from "./db";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(cors());

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
  } else {
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
      res.status(400).send("DB 오류");
    }
  }
});

app.post("/voice", (req: Request, res: Response) => {
  const {target, transcript, volume, finalScore} = req.body;

  if (target === undefined || transcript === undefined) {
    console.error("❌ 필수 데이터 누락:", { target, transcript });
    return res.status(400).send("주문 내용이나 인식된 텍스트가 없습니다.");
  }

  try{

    if(finalScore >= 50 && volume >= 10){
      res.status(200).send("음성인식을 성공 하였습니다.");
    }else{
      res.status(403).send("음성인식을 실패 하였습니다.");
    }
  } catch(err){
    console.error(err);
  }
});


app.post("/attack", (req: Request, res: Response) => {
  const { name, enemy, hp } = req.body;

  let multiplier = 1;

  if (enemy === "임진하&김윤지 선생님") {
    multiplier = 1.0;
  } else if (enemy === "박성래 선생님") {
    multiplier = 1.2;
  } else if (enemy === "교장선생님") {
    multiplier = 1.5;
  } else {
    return res.status(400).json({ success: false, message: "알 수 없는 적" });
  }

  const addedHp = Math.floor(hp * multiplier);
  const now = Date.now();

  try {
    db.prepare(`
      UPDATE users
      SET hp = hp + ?, scoreUpdatedAt = ?
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

app.post("/calc/ranking", (_req: Request, res: Response) => {
  try {
    const users = db.prepare(`
      SELECT id, name, hp, scoreUpdatedAt
      FROM users
      ORDER BY hp DESC, scoreUpdatedAt ASC
    `).all() as UserRow[];

    db.prepare(`DELETE FROM ranking`).run();

    let rank = 0;
    let prevHp: number | null = null;

    const insert = db.prepare(`
      INSERT INTO ranking (userId, name, rank, hp)
      VALUES (?, ?, ?, ?)
    `);

    for (const user of users) {
      if (prevHp === null || user.hp < prevHp) {
        rank++;
      }
      insert.run(user.id, user.name, rank, user.hp);
      prevHp = user.hp;
    }

    res.json({ message: "랭킹 계산 완료" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "랭킹 계산 오류" });
  }
});


app.get("/ranking", (req: Request, res: Response) => {
  try {
    const data = db
      .prepare(`SELECT rank, name, hp FROM ranking ORDER BY rank DESC`)
      .all();

    res.json({data: data});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "랭킹 조회 오류" });
  }
});

app.listen(3000, () => {
  console.log("Server running");
});