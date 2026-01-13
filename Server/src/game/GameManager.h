#pragma once

#include <vector>

#include "battle/Battle.h"
#include "../game/core/Character.h"
#include "../game/input/InputHandler.h"

class GameManager
{
    private :
        Battle battle;
        Character mirimE;

        std::vector<Character> enemies;
        int currentEnemyIndex;

        void SetupEnemies();

    public :
        GameManager();

        void Run();
};