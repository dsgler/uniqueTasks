#include <stdio.h>
#include <unistd.h>
#include <netdb.h>
#include <sys/socket.h>
#include <arpa/inet.h>
#include "dns_lookup.h"

int main(void)
{
    NetDnsTool dns;
    if (!dns.Init())
    {
        printf("init dns failed!\n");
        return -1;
    }
    std::string dnsServer = dns.GetDnsServer();
    if (dnsServer.empty())
    {
        printf("dns server not set!\n");
        return -1;
    }
    else
    {
        printf("dns server is [%s]\n", dnsServer.c_str());
    }
    std::string domain = "baidu.com";
    bool ret = dns.DnsLookup(dnsServer, domain);
    if (ret)
    {
        // bsgm,你直接调用现成函数？那写那么多干嘛
        struct hostent *he = gethostbyname(domain.c_str());
        if (he == nullptr)
        {
            printf("gethostbyname domain failed.\n");
            return -1;
        }
        else
        {
            struct in_addr **addrList = reinterpret_cast<struct in_addr **>(he->h_addr_list);
            for (int32_t i = 0; addrList[i] != nullptr; i++)
            {
                char ipStr[255] = {0};
                if (inet_ntop(AF_INET, addrList[i], ipStr, sizeof(ipStr)) == nullptr)
                {
                    continue;
                }
                printf("对照组：[%s]\n", ipStr);
            }
        }
    }
    else
    {
        printf("query dns return failed!\n");
    }
    return 0;
}