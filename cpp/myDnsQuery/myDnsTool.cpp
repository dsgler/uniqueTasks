#include "./myDnsTool.h"

using namespace MyDnsTool;

myDnsTool::myDnsTool() : socketId(-1), ProcessId(0), server("223.5.5.5") {}
myDnsTool::myDnsTool(std::string server) : socketId(-1), ProcessId(0) {
    if (server.empty()){
        this->server="223.5.5.5";
    }else{
        this->server=server;
    }
}

myDnsTool::~myDnsTool()
{
    if (socketId != -1)
    {
        close(socketId);
        socketId = -1;
    }
}

bool myDnsTool::init()
{
    socketId = socket(AF_INET, SOCK_DGRAM, 0);
    if (socketId < 0)
    {
        err = "创建socket错误";
        return false;
    }
    auto flags = fcntl(socketId, F_GETFL, 0);
    if (flags < 0)
    {
        err = "获取flags错误";
        return false;
    }
    fcntl(socketId, F_SETFL, flags | O_NONBLOCK);

    ProcessId = static_cast<unsigned short>(getpid());
    return true;
}

bool myDnsTool::query(std::string domain)
{
    if (server.empty())
    {
        err = "server不能为空";
        return false;
    }
    if (domain.empty())
    {
        err = "查询host不能为空";
        return false;
    }

    DnsHeader header = {.transId = ProcessId, .flags = htons(0x0100), .questionCount = htons(1), .answerCount = 0, .additionalCount = 0};
    // 让智能指针管理，自动释放
    auto uniPtr = std::make_unique<char[]>(DNS_QUERY_PACKET_MAX_SIZE);
    // 注意不能手动释放指针内存
    auto data = uniPtr.get();

    memset(data,0,DNS_QUERY_PACKET_MAX_SIZE);

    // 写入dns头部
    memcpy(data, &header, sizeof(header));
    int posi = sizeof(header);

    auto encodedDomain = EncodeDomain(domain);
    question ques = {.QNAME = encodedDomain, .QTYPE = htons(0x1), .QCLASS = htons(0x1)};
    int nameLen = encodedDomain.length() + 1;
    memcpy(data + posi, encodedDomain.c_str(), nameLen);
    posi += nameLen;
    memcpy(data + posi, reinterpret_cast<unsigned char *>(&ques.QTYPE), sizeof(ques.QTYPE));
    posi += sizeof(ques.QTYPE);
    memcpy(data + posi, reinterpret_cast<unsigned char *>(&ques.QCLASS), sizeof(ques.QCLASS));
    posi += sizeof(ques.QCLASS);

    auto addr = make_sockaddr_in(server, 53);
    if (addr == nullptr)
        return false;
    int resp = sendto(socketId, data, posi, 0, reinterpret_cast<const sockaddr *>(addr.get()), sizeof(sockaddr_in));
    if (resp < 0)
    {
        err = "连接socket失败: " + std::string(strerror(errno));
        return false;
    }

    return RecvDnsResponse(addr,5L);
}

bool myDnsTool::RecvDnsResponse(std::unique_ptr<const sockaddr_in>& addr, long timeOut)
{
    time_t start = time(nullptr);
    while (true)
    {
        time_t curr = time(nullptr);
        fd_set rdSet;
        FD_ZERO(&rdSet);
        FD_SET(socketId, &rdSet);
        struct timeval tv;
        tv.tv_sec = timeOut + start - curr;
        if (tv.tv_sec <= 0)
        {
            err="请求超时";
            return false;
        }
        tv.tv_usec = 0;
        int ret = select(socketId + 1, &rdSet, nullptr, nullptr, &tv);
        if (ret <= 0)
        {
            if (ret < 0 && (errno == EWOULDBLOCK || errno == EINTR || errno == EAGAIN))
            {
                continue;
            }
            else
            {
                err="请求超时";
                return false;
            }
        }
        unsigned char recvBuf[RECV_BUF_LENGTH] = {0};
        ret = recvfrom(socketId, recvBuf, RECV_BUF_LENGTH, 0, nullptr, nullptr);
        if (ret<0){
            err="recvfrom失败"+ std::string(strerror(errno));
            return false;
        }
        DnsHeader *pHeader = (DnsHeader *)recvBuf;
        if (pHeader->transId == ProcessId)
        {
            size_t posi = sizeof(DnsHeader);
            for (int i=ntohs(pHeader->questionCount);i>0;i--){
                // printf("查询的地址为：%s\n",recvBuf+posi);
                posi+=strlen((char *)recvBuf+posi)+1;
                posi += sizeof(question::QTYPE);
                posi += sizeof(question::QCLASS);
            }

            for (int i=ntohs(pHeader->answerCount);i>0;i--){
                // 上面跳过了question,现在准备跳过answer的name部分
                unsigned short name=*((unsigned short*)(recvBuf+posi));
                // 一种比较常见的情况，指向之前出现过的指针
                if (name==0x0cc0u){
                    posi+=2;
                }else{
                    posi+=strlen((char *)(recvBuf+posi))+1;
                }

                posi+=sizeof(answer::TYPE);
                posi += sizeof(answer::CLASS);
                posi+=sizeof(answer::TTL);

                uint16_t data_len=ntohs(*((uint16_t*)(recvBuf+posi)));
                // data len 的大小
                posi+=sizeof(answer::RDLENGTH);
                struct in_addr ip={0};
                memcpy(&ip.s_addr, recvBuf+posi, data_len);
                // printf("实验组：[%s]\n",inet_ntoa(ip));
                answers.push_back(std::string(inet_ntoa(ip)));
                posi+=data_len;
            }

            return true;
        }
        else
        {
            char str[1024];
            sprintf(str,"return dns header transid %d, flag %d\n", pHeader->transId, ntohs(pHeader->flags));
            err=std::string(str);
            return false;
        }
    }
    return false;
}

std::unique_ptr<const sockaddr_in> myDnsTool::make_sockaddr_in(std::string addr, unsigned int port)
{
    auto uniptr = std::unique_ptr<sockaddr_in>(new sockaddr_in);
    if (inet_pton(AF_INET, server.c_str(), &uniptr->sin_addr) <= 0)
    {
        err = "server解析错误,请输入ipv4,server:" + server;
        return nullptr;
    }
    uniptr->sin_family = AF_INET;
    uniptr->sin_port = htons(port);
    memset(&uniptr->sin_zero, 0, sizeof(uniptr->sin_zero));
    return uniptr;
}

/**
 * 域名编码函数
 * 例如: www.csdn.com --> 3www4csdn3com
 */
std::string myDnsTool::EncodeDomain(const std::string &domain)
{
    std::string encode;
    std::size_t start = 0;
    std::size_t end = 0;
    while ((end = domain.find('.', start)) != std::string::npos)
    {
        std::size_t len = end - start;
        encode.push_back(len);               // 添加每个标签的长度
        encode += domain.substr(start, len); // 添加标签内容
        start = end + 1;
    }
    if (start < domain.length())
    {
        std::size_t len = domain.length() - start;
        encode.push_back(len);
        encode += domain.substr(start);
    }

    return encode;
}