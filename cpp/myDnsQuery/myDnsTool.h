#ifndef MY_DNS_TOOL_H
#define MY_DNS_TOOL_H
#include <cstdint>
#include <string>
#include <vector>
#include <memory>
#include <unistd.h>
#include <sys/socket.h>
#include <fcntl.h>
#include <arpa/inet.h>
#include <string.h>
namespace MyDnsTool
{
    // 定义DNS头部结构体
    struct DnsHeader
    {
        uint16_t transId;         // 事务ID
        uint16_t flags;           // 标志位
        uint16_t questionCount;   // 问题数
        uint16_t answerCount;     // 答案数
        uint16_t authorityCount;  // 权威记录数
        uint16_t additionalCount; // 附加记录数
    };

    struct question
    {
        std::string QNAME;
        uint16_t QTYPE;
        uint16_t QCLASS;
    };

    struct answer
    {
        std::string NAME;
        uint16_t TYPE;
        uint16_t CLASS;
        uint32_t TTL;
        uint16_t RDLENGTH;
        std::string RDATA;
    };
    
    constexpr int MAX_DOMAIN_LENGTH=256;
    constexpr int DNS_QUERY_PACKET_MAX_SIZE=sizeof(DnsHeader)+MAX_DOMAIN_LENGTH+sizeof(question::QTYPE)+sizeof(question::QCLASS);

    constexpr int RECV_BUF_LENGTH = 1024;

    class myDnsTool
    {
    private:
        int socketId;
        unsigned short  ProcessId;
        std::unique_ptr<const sockaddr_in> make_sockaddr_in(std::string addr, unsigned int port);
        bool RecvDnsResponse(std::unique_ptr<const sockaddr_in>& addr, long timeOut);
    public:
        std::string server;
        std::vector<std::string> answers;
        std::string err;
        // 设置ProcessId和socketId
        myDnsTool();
        myDnsTool(std::string server);
        // 关闭 socket
        ~myDnsTool();
        // 创建socket
        bool init();
        bool query(std::string host);
        std::string EncodeDomain(const std::string &domain);
    };
}

#endif