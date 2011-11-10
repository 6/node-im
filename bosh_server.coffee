nxb = require 'node-xmpp-bosh'
port_number = 5280
bosh_server = nxb.start_bosh(
  port: port_number
  no_tls_domains: ['chat.facebook.com']
)
console.log "Started BOSH server on localhost:#{port_number}" 
