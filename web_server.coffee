express = require 'express'

port_number = 3000

app = express.createServer()
app.configure(() ->
  app.set "views", "#{__dirname}/views"
  app.set "view engine", "jade"

  app.use require("stylus").middleware(
    src: "#{__dirname}/public"
    compress: true
  )
  app.use express.static("#{__dirname}/public")
  app.use express.bodyParser()
  app.use app.router
)

app.get '/', (req, res) -> res.render 'index.jade', {layout: false}

exports.start = ->
  app.listen(port_number)
  console.log "Started web server on localhost:#{port_number}"
