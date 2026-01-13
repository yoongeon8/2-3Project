#include <iostream>
#include "Character.h"

Character::Character( const std::string& name, int hp, int atk, int strong ) : name( name ), maxHp( hp ), attack( atk ), strongAttack( strong )
{
    this -> hp = maxHp;
}

void Character::Attack( Character& target )
{
    target.TakeDamage( this -> attack );
}
void Character::StrongAttack( Character& target )
{
    target.TakeDamage(strongAttack);
}
void Character::TakeDamage( int dmg )
{
    this -> hp -= dmg;
    if( this -> hp < 0 ) this -> hp = 0;
}
bool Character::IsDead() const
{
    return hp <= 0;
}

std::string Character::GetName() const
{
    return this -> name;
}
int Character::GetHp() const
{
    return this -> hp;
}
int Character::GetAttack() const
{
    return this -> attack;
}
int Character::GetStrongAttack() const
{
    return this -> strongAttack;
}
void Character::PrintStatus()
{
    std::cout << "name : " << this -> name << std::endl;
    std::cout << "hp : " << this -> hp << std::endl;
    std::cout << "atk : " << this -> attack << std::endl;
}
