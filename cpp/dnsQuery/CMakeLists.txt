cmake_minimum_required(VERSION 3.5.0)
project(dnsq VERSION 0.1.0 LANGUAGES C CXX)

add_executable(dnsq dns_lookup.cpp dns_test.cpp)
