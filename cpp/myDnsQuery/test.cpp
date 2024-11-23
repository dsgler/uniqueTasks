#include "./myDnsTool.h"
// #include <stdio.h>
using namespace std;
#include <iostream>
int main(){
    MyDnsTool::myDnsTool tool("114.114.114.114");
    tool.init();
    tool.query("baidu.com");
    for (auto &str:tool.answers){
        cout<< str <<endl;
    }
}