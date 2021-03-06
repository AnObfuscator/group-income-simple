/* globals describe, it */

var PORT = 3000
var request = require('superagent')
var assert = require('assert')
var cookie1 = ''
var cookie2 = ''
var cookie3 = ''
var cookieParser = function (headers) {
  return headers['set-cookie'][0].split('; ')[0]
}

describe('Full walkthrough', function () {
  it('Should start the server', function () {
    return require('../backend/index.js')
  })

  describe('User', function () {
    it('Should GET (empty)', function (done) {
      request.get('http://localhost:' + PORT + '/user/1')
      .end(function (err, res) {
        assert(err === null)
        assert(res.res.statusCode === 200)
        assert(res.res.text === '')
        done()
      })
    })

    it('Should POST', function (done) {
      request.post('http://localhost:' + PORT + '/user/')
      .set('Content-Type', 'application/json')
      .send('{"name":"hi hello", "password":"baconbaconbacon", "email":"bob@test.com", "phone":"12345667", "contriGL":5, "contriRL":7}')
      .end(function (err, res) {
        assert(err === null)
        assert(res.res.statusCode === 200)
        var parsed = JSON.parse(res.res.text)
        assert(parsed.user != null)
        var url = parsed.link
        assert(url.length > 0)

        request.post(url)
        .end(function (err, res) {
          assert(err === null)
          assert(res.res.statusCode === 200)
          assert(res.res.text.length > 0)
          cookie1 = cookieParser(res.res.headers)
          assert(cookie1.length > 0)
          done()
        })
      })
    })

    it('Should GET (non-empty)', function (done) {
      request.get('http://localhost:' + PORT + '/user/1')
      .end(function (err, res) {
        assert(err === null)
        assert(res.res.statusCode === 200)
        var parsed = JSON.parse(res.res.text)
        assert(parsed.id === 1)
        assert(parsed.name === 'hi hello')
        assert(parsed.email === 'bob@test.com')
        assert(parsed.phone === '12345667')
        assert(parsed.contriGL === 5)
        assert(parsed.contriRL === 7)
        assert(parsed.verification === null)
        done()
      })
    })

    it('Should POST (2)', function (done) {
      request.post('http://localhost:' + PORT + '/user/')
      .set('Content-Type', 'application/json')
      .send('{"name":"User number two", "password":"baconbaconbacon", "email":"jack@test.com", "phone":"959040392", "contriGL":2, "contriRL":99}')
      .end(function (err, res) {
        assert(err === null)
        assert(res.res.statusCode === 200)
        var parsed = JSON.parse(res.res.text)
        assert(parsed.user != null)
        var url = parsed.link
        assert(url.length > 0)

        request.post(url)
        .end(function (err, res) {
          assert(err === null)
          assert(res.res.statusCode === 200)
          assert(res.res.text.length > 0)
          cookie2 = cookieParser(res.res.headers)
          assert(cookie2.length > 0)
          done()
        })
      })
    })

    it('Should POST (3)', function (done) {
      request.post('http://localhost:' + PORT + '/user/')
      .set('Content-Type', 'application/json')
      .send('{"name":"User number three", "password":"baconbaconbacon", "email":"john@test.com", "phone":"6478392654", "contriGL":20, "contriRL":1}')
      .end(function (err, res) {
        assert(err === null)
        assert(res.res.statusCode === 200)
        var parsed = JSON.parse(res.res.text)
        assert(parsed.user != null)
        var url = parsed.link
        assert(url.length > 0)

        request.post(url)
        .end(function (err, res) {
          assert(err === null)
          assert(res.res.statusCode === 200)
          assert(res.res.text.length > 0)
          cookie3 = cookieParser(res.res.headers)
          assert(cookie3.length > 0)
          done()
        })
      })
    })
  })

  describe('Group', function () {
    it('Should GET (no cookie)', function (done) {
      request.get('http://localhost:' + PORT + '/group/1')
      .end(function (err, res) {
        assert(err != null)
        assert(res.res.statusCode === 401)
        done()
      })
    })

    it('Should POST', function (done) {
      request.post('http://localhost:' + PORT + '/group/')
      .set('Content-Type', 'application/json')
      .set('Cookie', cookie1)
      .send('{"name":"my super group"}')
      .end(function (err, res) {
        assert(err === null)
        assert(res.res.statusCode === 200)
        var parsed = JSON.parse(res.res.text)
        assert(parsed.group != null)
        done()
      })
    })

    it('Should GET (non-empty)', function (done) {
      request.get('http://localhost:' + PORT + '/group/1')
      .set('Cookie', cookie1)
      .end(function (err, res) {
        assert(err === null)
        assert(res.res.statusCode === 200)
        var parsed = JSON.parse(res.res.text)
        assert(parsed.id === 1)
        assert(parsed.userId === 1)
        assert(parsed.groupId === 1)
        assert(parsed.User.id === 1)
        assert(parsed.BIGroup.id === 1)
        done()
      })
    })

    it('Should GET (unauthorized)', function (done) {
      request.get('http://localhost:' + PORT + '/group/1')
      .set('Cookie', cookie2)
      .end(function (err, res) {
        assert(err === null)
        assert(res.res.statusCode === 200)
        assert(res.res.text === '')
        done()
      })
    })
  })

  describe('Session', function () {
    it('Should logout', function (done) {
      request.post('http://localhost:' + PORT + '/session/logout')
      .set('Cookie', cookie1)
      .end(function (err, res) {
        assert(err === null)
        assert(res.res.statusCode === 200)
        assert(res.res.text === '')
        cookie1 = ''
        done()
      })
    })

    it('Should be unauthorized to load a group', function (done) {
      request.get('http://localhost:' + PORT + '/group/1')
      .set('Cookie', cookie1)
      .end(function (err, res) {
        assert(err != null)
        assert(res.res.statusCode === 401)
        done()
      })
    })

    it('Should not login (invalid password)', function (done) {
      request.post('http://localhost:' + PORT + '/session/login')
      .set('Content-Type', 'application/json')
      .send('{"email":"bob@test.com", "password":"invalidpassword"}')
      .end(function (err, res) {
        assert(err != null)
        assert(res.res.statusCode === 500) // Good enough for now
        assert(res.res.text.length > 0)
        done()
      })
    })

    it('Should login', function (done) {
      request.post('http://localhost:' + PORT + '/session/login')
      .set('Content-Type', 'application/json')
      .send('{"email":"bob@test.com", "password":"baconbaconbacon"}')
      .end(function (err, res) {
        cookie1 = cookieParser(res.res.headers)
        assert(err === null)
        assert(res.res.statusCode === 200)
        assert(res.res.text.length > 0)
        done()
      })
    })
  })

  describe('Invite', function () {
    it('Should refuse to invite if not part of the group', function (done) {
      request.post('http://localhost:' + PORT + '/invite/')
      .set('Content-Type', 'application/json')
      .set('Cookie', cookie3)
      .send('{"groupId":1, "email":"invited@test.com"}')
      .end(function (err, res) {
        assert(err != null)
        assert(res.res.statusCode === 500)
        assert(res.res.text.length > 0)
        done()
      })
    })

    it('Should create an invitation and send an email', function (done) {
      request.post('http://localhost:' + PORT + '/invite/')
      .set('Content-Type', 'application/json')
      .set('Cookie', cookie1)
      .send('{"groupId":1, "email":"invited@test.com"}')
      .end(function (err, res) {
        assert(err === null)
        assert(res.res.statusCode === 200)
        var parsed = JSON.parse(res.res.text)
        var url = parsed.link
        assert(url.length > 0)

        request.post(url)
        .redirects(0)
        .end(function (err, res) {
          assert(err != null)
          assert(res.res.statusCode === 302)
          assert(res.res.text.length > 0)
          done()
        })
      })
    })

    it('Should create an invitation and send an email', function (done) {
      request.post('http://localhost:' + PORT + '/invite/')
      .set('Content-Type', 'application/json')
      .set('Cookie', cookie1)
      .send('{"groupId":1, "email":"jack@test.com"}')
      .end(function (err, res) {
        assert(err === null)
        assert(res.res.statusCode === 200)
        var parsed = JSON.parse(res.res.text)
        var url = parsed.link
        assert(url.length > 0)

        request.post(url)
        .redirects(0)
        .end(function (err, res) {
          assert(err === null)
          assert(res.res.statusCode === 200)
          assert(res.res.text.length > 0)
          done()
        })
      })
    })
  })

  describe('Income', function () {
    var income = null
    it('Should be possible to create an income', function (done) {
      request.post('http://localhost:' + PORT + '/income/')
      .set('Content-Type', 'application/json')
      .set('Cookie', cookie1)
      .send('{"amount": 1200}')
      .end(function (err, res) {
        assert(err === null)
        assert(res.res.statusCode === 200)
        assert(res.res.text.length > 0)
        income = JSON.parse(res.res.text).income
        assert(income.amount === 1200)
        done()
      })
    })

    it('Should be possible to update an income', function (done) {
      request.post('http://localhost:' + PORT + '/income/')
      .set('Content-Type', 'application/json')
      .set('Cookie', cookie1)
      .send('{"amount": 1500}')
      .end(function (err, res) {
        assert(err === null)
        assert(res.res.statusCode === 200)
        assert(res.res.text.length > 0)
        var newIncome = JSON.parse(res.res.text).income
        assert(newIncome.amount === 1500)
        assert(newIncome.id === income.id)
        done()
      })
    })
  })
})
