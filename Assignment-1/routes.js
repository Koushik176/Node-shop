const requestHandler = (req, res) => {
  const url = req.url
  const method = req.method
  if (url === "/") {
    res.write("<html>")
    res.write(
      '<body><form action="/create-user" method="POST"><input type="text" name="user"><button type="submit">Send</button></form></body>'
    )
    res.write("</html>")
    return res.end()
  }
  if (url === "/create-user" && method === "POST") {
    const body = []
    req.on("data", (chunk) => {
      console.log(chunk)
      body.push(chunk)
    })
    return req.on("end", () => {
      const parsedBody = Buffer.concat(body).toString()
      const user = parsedBody.split("=")[1]
      console.log(user)
      res.statusCode = 302
      res.setHeader("Location", "/")
      return res.end()
    })
  }
  if (url === "/users") {
    res.write("<html>")
    res.write("<ul><li>user1</li></ul>")
    res.write("</html>")
    return res.end()
  }
}

module.exports = requestHandler
