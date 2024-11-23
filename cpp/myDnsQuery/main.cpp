#include <iostream>
#include "./myDnsTool.h"
#include <string>
#include <vector>
using namespace std;

int main(){
    string server;
    cout<<"请输入提供查询的服务器ipv4(默认223.5.5.5)"<<endl;
    // cin>>server;
    getline(cin,server);
    MyDnsTool::myDnsTool tool(server);
    tool.init();
    if (!tool.err.empty()){
        cout<<tool.err<<endl;
        return -1;
    }
    cout<<"请输入查询的域名"<<endl;
    string domain;
    cin>>domain;
    tool.query(domain);
    if (!tool.err.empty()){
        cout<<tool.err<<endl;
        return -1;
    }

    cout<<"查询到"<<tool.answers.size()<<"个ip，它们是："<<endl;

    for (auto ele:tool.answers){
        cout<<ele<<endl;
    }

}