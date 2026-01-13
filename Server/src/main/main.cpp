#include "../game/GameManager.h"
#include <iostream>

int main()
{
    GameManager game;
    game.Run();
    std::cout << "전투 종료\n";

    return 0;
}