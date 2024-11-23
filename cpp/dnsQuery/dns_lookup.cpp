#include "dns_lookup.h"
#include <fstream>
#include <memory>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <fcntl.h>
#include <unistd.h>
#include <sys/types.h>
#include <sys/select.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <time.h>

// 定义DNS配置文件路径
constexpr char DNS_CONF_FILE[] = "/etc/resolv.conf";
// 接收缓冲区长度
constexpr int RECV_BUF_LENGTH = 1024;
// DNS服务端口号
constexpr int DNS_PORT = 53;
// 最大域名长度
constexpr int MAX_DOMAIN_LENGTH = 255;
// DNS类型大小
constexpr int DNS_TYPE_SIZE = 2;
// DNS类大小
constexpr int DNS_CLASS_SIZE = 2;

// 定义DNS头部结构体
struct DnsHeader
{
    unsigned short transId;         // 事务ID
    unsigned short flags;           // 标志位
    unsigned short questionCount;   // 问题数
    unsigned short answerCount;     // 答案数
    unsigned short authorityCount;  // 权威记录数
    unsigned short additionalCount; // 附加记录数
};

// 最大DNS数据包大小
constexpr int DNS_PACKET_MAX_SIZE = sizeof(DnsHeader) + MAX_DOMAIN_LENGTH + DNS_TYPE_SIZE + DNS_CLASS_SIZE;

// 构造函数，初始化套接字和进程ID
NetDnsTool::NetDnsTool() : mSocket(-1), mProcessId(0)
{
}

// 析构函数，关闭套接字
NetDnsTool::~NetDnsTool()
{
    if (mSocket != -1)
    {
        close(mSocket);
        mSocket = -1;
    }
}

// 初始化DNS工具，创建非阻塞UDP套接字
bool NetDnsTool::Init()
{   //               ipv4     udp        默认协议
    mSocket = socket(AF_INET, SOCK_DGRAM, 0);
    if (mSocket < 0)
    {
        return false;
    }
    // 获取 mSocket 的 flags
    int flags = fcntl(mSocket, F_GETFL, 0);
    if (flags < 0)
    {
        return false;
    }
    // 设置为 非阻塞I/O
    fcntl(mSocket, F_SETFL, flags | O_NONBLOCK);
    mProcessId = static_cast<unsigned short>(getpid());
    return true;
}

// 获取DNS服务器地址(从/etc/resolv.conf中)
std::string NetDnsTool::GetDnsServer(void)
{
    std::string ret;
    std::ifstream fp;
    fp.open(DNS_CONF_FILE);
    if (!fp.is_open())
    {
        return ret;
    }
    std::string line;
    std::string emit = "nameserver";
    while (std::getline(fp, line))
    {
        if (line.empty() || line[0] == '#')
        {
            continue;
        }
        if (line.substr(0, emit.length()) == emit)
        {
            ret = line.substr(emit.length() + 1);
            break;
        }
    }
    fp.close();
    return ret;
}

// 进行DNS查询
bool NetDnsTool::DnsLookup(const std::string &dnsServer, const std::string &domain, long timeOut)
{
    return QueryInternal(dnsServer, domain, timeOut);
}

// 内部查询函数，发送DNS请求并接收响应
bool NetDnsTool::QueryInternal(const std::string &dnsServer, const std::string &domain, long timeOut)
{
    if (dnsServer.empty() || domain.empty())
    {
        return false;
    }
    struct sockaddr_in addr;
    memset(&addr, 0, sizeof(addr));
    addr.sin_family = AF_INET;
    addr.sin_addr.s_addr = inet_addr(dnsServer.c_str());
    if (addr.sin_addr.s_addr == INADDR_NONE)
    {
        printf("Input dns server [%s] is not correct!", dnsServer.c_str());
        return false;
    }
    addr.sin_port = htons(DNS_PORT);
    if (!SendDnsRequest(addr, domain))
    {
        return false;
    }
    return RecvDnsResponse(addr, timeOut);
}

// 发送DNS请求
bool NetDnsTool::SendDnsRequest(const struct sockaddr_in &addr, const std::string &domain)
{
    // 打包DNS请求信息
    std::unique_ptr<char[]> uniPtr = std::make_unique<char[]>(DNS_PACKET_MAX_SIZE);
    char *data = uniPtr.get();
    if (data == nullptr)
    {
        return false;
    }
    DnsHeader *header = reinterpret_cast<DnsHeader *>(data);
    header->transId = mProcessId;     // 设置事务ID
    header->flags = htons(0x0100);    // 标志位，标准查询
    header->questionCount = htons(1); // 问题数为1；htons用于转换字节序
    header->answerCount = 0;
    header->authorityCount = 0;
    header->additionalCount = 0;
    std::string enDomain = EncodeDomain(domain); // 将域名进行编码
    size_t pos = sizeof(DnsHeader);
    size_t max = DNS_PACKET_MAX_SIZE;
    // 将enDomain写入data
    memcpy(data + pos, enDomain.c_str(), enDomain.length());
    // +1是为了越过'\0'
    pos += enDomain.length() + 1;
    unsigned short queryType = htons(0x1);  // 查询类型为A记录
    unsigned short queryClass = htons(0x1); // 查询类为IN
    memcpy(data + pos, (char *)&queryType, DNS_TYPE_SIZE);
    pos += DNS_TYPE_SIZE;
    memcpy(data + pos, (char *)&queryClass, DNS_CLASS_SIZE);
    pos += DNS_CLASS_SIZE;

    // send的udp版本     缓冲区  大小 flag   addr                  addr大小
    if (sendto(mSocket, data, pos, 0, (struct sockaddr *)&addr, sizeof(addr)) < 0)
    {
        printf("Failed to send dns request info!");
        return false;
    }
    return true;
}

// 接收DNS响应
bool NetDnsTool::RecvDnsResponse(const struct sockaddr_in &addr, long timeOut)
{
    time_t start = time(nullptr);
    while (true)
    {
        time_t curr = time(nullptr);
        fd_set rdSet;
        FD_ZERO(&rdSet);
        FD_SET(mSocket, &rdSet);
        struct timeval tv;
        tv.tv_sec = timeOut + start - curr;
        if (tv.tv_sec <= 0)
        {
            return false;
        }
        tv.tv_usec = 0;
        int ret = select(mSocket + 1, &rdSet, nullptr, nullptr, &tv);
        if (ret <= 0)
        {
            if (ret < 0 && (errno == EWOULDBLOCK || errno == EINTR || errno == EAGAIN))
            {
                continue;
            }
            else
            {
                printf("select return timeout\n");
                return false;
            }
        }
        unsigned char recvBuf[RECV_BUF_LENGTH] = {0};
        ret = recvfrom(mSocket, recvBuf, RECV_BUF_LENGTH, 0, nullptr, nullptr);
        if (ret < 0)
        {
            printf("recvfrom return failed\n");
            continue;
        }
        DnsHeader *pHeader = (DnsHeader *)recvBuf;
        if (pHeader->transId == mProcessId)
        {
            size_t pos = sizeof(DnsHeader);
            for (int i=ntohs(pHeader->questionCount);i>0;i--){
                printf("查询的地址为：%s\n",recvBuf+pos);
                pos+=strlen((char *)recvBuf+pos)+1;
                pos += DNS_TYPE_SIZE;
                pos += DNS_CLASS_SIZE;
            }

            for (int i=ntohs(pHeader->answerCount);i>0;i--){
                // 上面跳过了question,现在准备跳过answer的name部分
                unsigned short name=*((unsigned short*)(recvBuf+pos));
                // 一种比较常见的情况，指向之前出现过的指针
                if (name==0x0cc0u){
                    pos+=2;
                }else{
                    pos+=strlen((char *)(recvBuf+pos))+1;
                }

                pos+=DNS_TYPE_SIZE;
                pos += DNS_CLASS_SIZE;
                // ttl size
                pos+=4;

                uint16_t data_len=ntohs(*((uint16_t*)(recvBuf+pos)));
                // data len 的大小
                pos+=2;
                struct in_addr ip={0};
                memcpy(&ip.s_addr, recvBuf+pos, data_len);
                printf("实验组：[%s]\n",inet_ntoa(ip));
                pos+=data_len;
            }

            return true;
        }
        else
        {
            printf("return dns header transid %d, flag %d\n", pHeader->transId, ntohs(pHeader->flags));
        }
    }
    return false;
}

/**
 * 域名编码函数
 * 例如: www.csdn.com --> 3www4csdn3com
 */
std::string NetDnsTool::EncodeDomain(const std::string &domain)
{
    std::string encode;
    std::size_t beg = 0;
    std::size_t end = 0;
    while ((end = domain.find('.', beg)) != std::string::npos)
    {
        std::size_t pos = end - beg;
        encode.push_back(pos);             // 添加每个标签的长度
        encode += domain.substr(beg, pos); // 添加标签内容
        beg = end + 1;
    }
    if (beg < domain.length())
    {
        std::size_t pos = domain.length() - beg;
        encode.push_back(pos);
        encode += domain.substr(beg);
    }
    return encode;
}