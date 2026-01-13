#include <fstream>
#include <iostream>

#include "InputHandler.h"
#include "../json.hpp"


using json = nlohmann::json;

InputHandler::InputHandler(const std::string& filePath)
{
    std::ifstream file(filePath);
    if (!file.is_open())
    {
        std::cerr << "Input JSON 파일 열기 실패: " << filePath << "\n";
        return;
    }

    try
    {
        json j;
        file >> j;
        if (j.is_array())
        {
            inputs = j.get<std::vector<json>>();
        }
        else
        {
            inputs.push_back(j);
        }
    }
    catch (...)
    {
        std::cerr << "Input JSON 파싱 실패\n";
    }
}

AttackResult InputHandler::ResolveFromJson()
{
    if (index >= inputs.size())
    {
        return { AttackType::Fail, "" };
    }

    json j = inputs[index++];
    std::string spellId = j.value("spellId", "");
    float pronunciation = j.value("pronunciation", 0.0f);
    int volume = j.value("volume", 0);

    // 1차
    if (pronunciation < 60)
        return { AttackType::Fail, spellId };

    // 2차
    if (volume >= 35)
        return { AttackType::Fail, spellId };
    else if (volume >= 20)
        return { AttackType::Strong, spellId };
    else if (volume >= 5)
        return { AttackType::Normal, spellId };

    return { AttackType::Fail, spellId };
}