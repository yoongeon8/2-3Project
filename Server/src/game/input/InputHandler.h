#pragma once

#include <string>
#include <vector>

#include "../json.hpp"

enum class AttackType
{
    Fail,
    Normal,
    Strong
};

struct AttackResult
{
    AttackType type;
    std::string spellId;
};

class InputHandler
{
public:
    InputHandler(const std::string& filePath);
    AttackResult ResolveFromJson();

private:
    std::vector<nlohmann::json> inputs;
    size_t index = 0;
};