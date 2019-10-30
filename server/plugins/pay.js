const { payApiKey, payApiUrl, payReturnUrl } = require('../config')
const Wreck = require('@hapi/wreck')

const options = {
  headers: {
    Authorization: `Bearer ${payApiKey}`,
    'content-type': 'application/json'
  }
}

const payRequestData = (amount, reference, description) => {
  return {
    amount,
    reference,
    description,
    'return_url': payReturnUrl
  }
}

const payRequest = async (amount, reference, description) => {
  const data = { ...options, payload: payRequestData(amount, reference, description) }
  try {
    const { payload } = await Wreck.post(`${payApiUrl}/payments`, data)
    return JSON.parse(payload.toString())
  } catch (e) {
    throw e
  }
}

const payStatus = async (url) => {
  try {
    const { payload } = await Wreck.get(url, options)
    return JSON.parse(payload.toString())
  } catch (e) {
    throw e
  }
}

const pay = {
  plugin: {
    name: 'pay',
    dependencies: 'vision',
    multiple: true,
    register: (server) => {
      server.route({
        method: 'get',
        path: '/status',
        handler: async (request, h) => {
          const { self, reference } = request.yar.get('pay')
          try {
            let { state } = await payStatus(self)
            if (state.finished) {
              switch (state.status) {
                case 'success':
                  return h.redirect(`/confirmation/${reference}`)
                case 'failed':
                case 'error':
                  return h.redirect(`/status/error/${reference}`)
              }
            } else {
              // TODO:- unfinished payment flow?
            }
          } catch (ex) {
            console.log(ex)
          }
        }
      })

      server.route({
        method: 'get',
        path: '/confirmation/{reference}',
        handler: async (request, h) => {
          let { reference } = request.params
          return h.view('confirmation', { reference })
        }
      })

      server.route({
        method: 'get',
        path: '/status/error/{reference}',
        handler: async (request, h) => {
          // TODO:- flash error from pay api
          let { reference } = request.params
          return h.view('application-error', { reference })
        }
      })
    }
  }
}

module.exports = {
  payRequest, payStatus, pay
}