#pragma once

#include <string>

class Character 
{
    private :
        std::string name;
        int maxHp;
        int hp;
        int attack;
        int strongAttack;

    public :
        Character( const std::string& name, int hp, int attack, int strongAttack );

        void Attack( Character& target );
        void StrongAttack( Character& target );
        void TakeDamage( int dmg );
        bool IsDead() const;

        std::string GetName() const;
        int GetHp() const;
        int GetAttack() const;
        int GetStrongAttack() const;

        void PrintStatus();
};