import http.client

user1 = "7551e9d9-3f6a-41a7-8f7d-11868c7c8584"
user2 = "3aae739c-dbf5-4c2a-b5d1-091deb320baa"

while True:
    conn = http.client.HTTPConnection("localhost:3000")

    payload = "{\n\t\"ticker\": \"AMZ\",\n\t\"marketAction\": \"BUY\",\n\t\"shares\": 10,\n\t\"price\": 7\n}"

    headers = {
        'Content-Type': "application/json",
        'session': user1
        }

    conn.request("POST", "/market-action", payload, headers)

    res = conn.getresponse()
    data = res.read()

    print(data.decode("utf-8"))
    conn = http.client.HTTPConnection("localhost:3000")

    payload = "{\n\t\"ticker\": \"AMZ\",\n\t\"marketAction\": \"SELL\",\n\t\"shares\": 5,\n\t\"price\": 0.02\n}"

    headers = {
        'Content-Type': "application/json",
        'session': user2
        }

    conn.request("POST", "/market-action", payload, headers)

    res = conn.getresponse()
    data = res.read()

    print(data.decode("utf-8"))