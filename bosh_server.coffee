"""
Basic BOSH server using node-xmpp-bosh package.
This converts stateful XMPP sessions to stateless HTTP sessions.

For more information on BOSH, see here:
http://xmpp.org/extensions/xep-0124.html
"""
nxb = require 'node-xmpp-bosh'

# 5280 is the default BOSH port
port_number = 5280

exports.start = ->
  bosh_server = nxb.start_bosh(
    port: port_number
  )
  console.log "Started BOSH server on localhost:#{port_number}" 
