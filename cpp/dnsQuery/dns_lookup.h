#ifndef NET_DNS_TOOL_H
#define NET_DNS_TOOL_H

#include <string>
#include <netinet/in.h>

class NetDnsTool
{
public:
    NetDnsTool();
    ~NetDnsTool();
    bool Init();
    std::string GetDnsServer(void);
    bool DnsLookup(const std::string &dnsServer, const std::string &domain, long timeOut = 5);

private:
    bool QueryInternal(const std::string &dnsServer, const std::string &domain, long timeOut = 5);
    bool SendDnsRequest(const struct sockaddr_in &addr, const std::string &domain);
    bool RecvDnsResponse(const struct sockaddr_in &addr, long timeOut);
    std::string EncodeDomain(const std::string &domain);

private:
    int mSocket;
    unsigned short mProcessId;
};
#endif