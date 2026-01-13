cmake_minimum_required(VERSION 3.10)
project(GameProject)

set(CMAKE_CXX_STANDARD 11)
set(CMAKE_CXX_STANDARD_REQUIRED True)

# Include directories
include_directories(src/game/core)
include_directories(src/game)
include_directories(src/game/battle)
include_directories(src/game/input)

# Source files
file(GLOB_RECURSE SOURCES
    src/main/*.cpp
    src/game/*.cpp
    src/game/core/*.cpp
    src/game/battle/*.cpp
    src/game/input/*.cpp
)

# Executable
add_executable(main ${SOURCES})