#include "GameManager.h"
#include <iostream>
#include <fstream>
#include <windows.h>

std::ofstream outputFile("src/game/input/output.json");

GameManager::GameManager()
    : mirimE("미림이", 100000, 10000, 15000),
      currentEnemyIndex(0)
{
    SetupEnemies();
}

void GameManager::SetupEnemies()
{
    enemies.emplace_back("진하쌤, 윤지쌤", 50000, 10000, 20000);
    enemies.emplace_back("성래쌤", 70000, 20000, 25000);
    enemies.emplace_back("교장쌤", 75000, 22000, 28000);
}

void GameManager::Run()
{
    InputHandler input("src\\game\\input\\input.json");

    std::cout << "전투 시작\n";

    while (currentEnemyIndex < enemies.size())
    {
        Character& enemy = enemies[currentEnemyIndex];
        std::cout << enemy.GetName() << " 등장\n";

        battle.Start(mirimE, enemy);

        while (battle.IsRunning())
        {
            AttackResult action = input.ResolveFromJson();
            battle.Update( action );
        }

        if (mirimE.IsDead())
        {
            std::cout << "패배\n";
            return;
        }

        std::cout << enemy.GetName() << " 처치\n";

        // 스토리 진행 (마지막 적이 아니면)
        if (currentEnemyIndex < enemies.size() - 1) {
            outputFile << R"({"event": "story", "message": ")" << (currentEnemyIndex + 1) << R"(번째 선생님을 물리쳤다! 스토리 진행..."} )" << std::endl;
            std::cout << "스토리 진행...\n";
            Sleep(3000);
        }

        currentEnemyIndex++;
    }

    std::cout << "모든 적 처치\n";
}
