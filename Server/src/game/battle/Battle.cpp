#include <windows.h>
#include <iostream>
#include <fstream>

#include "../json.hpp"

#include "Battle.h"

extern std::ofstream outputFile;

Battle::Battle()
    : player(nullptr), enemy(nullptr),
      currentTurn(Turn::PLAYER),
      running(false)
{
}

void Battle::Start(Character& p, Character& e)
{
    player = &p;
    enemy = &e;
    currentTurn = Turn::PLAYER;
    running = true;

    nlohmann::json output;
    output["event"] = "battle_start";
    output["player"] = {{"name", player->GetName()}, {"hp", player->GetHp()}};
    output["enemy"] = {{"name", enemy->GetName()}, {"hp", enemy->GetHp()}};
    std::string jsonStr = output.dump();
    outputFile << jsonStr << std::endl;
}

bool Battle::IsRunning() const
{
    return running;
}

void Battle::Update( const AttackResult& action )
{
    if (!running) return;

    if (currentTurn == Turn::PLAYER)
        PlayerTurn( action );
    else
        EnemyTurn();

    CheckEnd();
}

void Battle::PlayerTurn( const AttackResult& result )
{
    nlohmann::json output;
    output["event"] = "player_turn";
    output["spellId"] = result.spellId;
    Sleep(TURN_DELAY_MS);

    if (result.type == AttackType::Fail)
    {
        output["result"] = "fail";
    }
    else if (result.type == AttackType::Normal)
    {
        int damage = player->GetAttack();
        enemy->TakeDamage(damage);
        output["result"] = "normal";
        output["damage"] = damage;
        output["enemyHp"] = enemy->GetHp();
    }
    else if (result.type == AttackType::Strong)
    {
        int damage = player->GetStrongAttack();
        enemy->TakeDamage(damage);
        output["result"] = "strong";
        output["damage"] = damage;
        output["enemyHp"] = enemy->GetHp();
    }

    std::string jsonStr = output.dump();
    outputFile << jsonStr << std::endl;
    currentTurn = Turn::ENEMY;
}

void Battle::EnemyTurn()
{
    nlohmann::json output;
    output["event"] = "enemy_turn";
    Sleep(TURN_DELAY_MS);

    int roll = rand() % 100;

    if (roll < 10)
    {
        int damage = enemy->GetStrongAttack();
        player->TakeDamage(damage);
        output["result"] = "strong";
        output["damage"] = damage;
        output["playerHp"] = player->GetHp();
    }
    else
    {
        int damage = enemy->GetAttack();
        player->TakeDamage(damage);
        output["result"] = "normal";
        output["damage"] = damage;
        output["playerHp"] = player->GetHp();
    }

    std::string jsonStr = output.dump();
    outputFile << jsonStr << std::endl;
    currentTurn = Turn::PLAYER;
}

void Battle::CheckEnd()
{
    if (player->IsDead() || enemy->IsDead())
    {
        running = false;
        nlohmann::json output;
        output["event"] = "battle_end";
        output["winner"] = player->IsDead() ? "enemy" : "player";
        std::string jsonStr = output.dump();
        outputFile << jsonStr << std::endl;
    }
}
