#pragma once

#include "../core/Character.h"
#include "../input/InputHandler.h"

#include <iostream>
#include <cstdlib>

const int TURN_DELAY_MS = 3000;

enum class Turn {
    PLAYER,
    ENEMY
};

class Battle
{
    private :
        Character* player;
        Character* enemy;
        Turn currentTurn;
        bool running;

        void PlayerTurn( const AttackResult& action );
        void EnemyTurn();
        void CheckEnd();

    public :
        Battle();

        void Start(Character& player, Character& enemy);
        void Update( const AttackResult& action );
        bool IsRunning() const;

};