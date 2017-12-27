const getServer = require('../../../index');
const models = require('../../../models/index');
const createToken = require('../../../util/token');
const { it, describe, beforeEach } = exports.lab = require('lab').script();
const Code = require('code');
const expect = Code.expect;

describe("login endpoint", () => {

  let server = null;
  let requestDefaults = null;

  beforeEach(async ()=>{
    server = await getServer();
    requestDefaults = {
      method: 'POST',
      url: '/api/v1/login ',
      payload: {}
    };
    await server.inject({
      method: 'POST',
      url: '/api/v1/signup ',
      payload: {
        firstName: "Cristian",
        lastName: "Torres",
        email: "ctorresthrash@gmail.com",
        username: "ctorres",
        password: "password",
        passwordConfirmation: "password" 
      }
    });
  });

  it('bad payload -> 400 Bad Request', t => {
    const request = Object.assign({}, requestDefaults);
  
    return server
      .inject(request)
      .then(response => {
        expect(response.statusCode).to.be.equal(400);
      });
  });

  it('invalid password -> 401 Unauthorized', t => {
    const request = Object.assign({}, requestDefaults, {
      payload: {
        username: "ctorres",
        password: "ctorres"
      }
    });
  
    return server
      .inject(request)
      .then(response => {
        expect(response.statusCode).to.be.equal(401);
      });
  });

  it('invalid user -> 401 Unauthorized', t => {
    const request = Object.assign({}, requestDefaults, {
      payload: {
        username: "ctorresp",
        password: "ctorres"
      }
    });
  
    return server
      .inject(request)
      .then(response => {
        expect(response.statusCode).to.be.equal(401);
      });
  });
  
  it('correct payload and valid user -> 200 OK', t => {
    const request = Object.assign({}, requestDefaults, {
      payload: {
        username: "ctorres",
        password: "password"
      }
    });
  
    return server
      .inject(request)
      .then(response => {
        expect(response.statusCode).to.be.equal(200);        
        expect(response.result.username).to.be.equal(request.payload.username);
        expect(response.result.token).to.be.equal(createToken(response.result));
      });
  });
});

describe("signup endpoint", ()=>{

  let server = null;
  let requestDefaults = null;

  beforeEach(async ()=>{
    server = await getServer();
    await models.User.destroy({
      where: {},
      truncate: true
    });
    console.log("delete users");
    requestDefaults = {
      method: 'POST',
      url: '/api/v1/signup ',
      payload: {}
    };
  });

  it('endpoint empty payload -> 400 Bad Request', t => {
    const request = Object.assign({}, requestDefaults);
  
    return server
      .inject(request)
      .then(response => {
        expect(response.statusCode).to.be.equal(400);
      });
  });
  
  it('endpoint correct payload -> 200 OK', t => {
    const request = Object.assign({}, requestDefaults, {
      payload: {
        firstName: "Cristian",
        lastName: "Torres",
        email: "ctorresthrash@gmail.com",
        username: "ctorres",
        password: "password",
        passwordConfirmation: "password" 
      }
    });
  
    return server
      .inject(request)
      .then(async response => {
        expect(response.statusCode).to.be.equal(201);
        const payloadKeys = Object.keys(request.payload)
          .filter(key=>!(key==='password' || key==="passwordConfirmation"))
          .forEach(key=>{
            expect(response.result[key]).to.be.equal(request.payload[key]);
          })
        expect(response.result.token).to.be.equal(createToken(response.result));
      });
  });
  
  it('endpoint bad request if email exists', async t => {
    const request = Object.assign({}, requestDefaults, {
      payload: {
        firstName: "Cristian",
        lastName: "Torres",
        email: "ctorresthrash@gmail.com",
        username: "ctorres",
        password: "password",
        passwordConfirmation: "password" 
      }
    });

    const emailPayload = Object.assign({}, request.payload, {username: "username"});
    console.log(emailPayload);
  
    await server.inject(request);
    return server
      .inject(Object.assign({}, request, {payload: emailPayload})).then(response=>{
        expect(response.statusCode).to.be.equal(400);
        expect(response.result.message).to.be.equal(`Email taken\n`);
      });
  });

  it('endpoint bad request if username exists', async t => {
    const request = Object.assign({}, requestDefaults, {
      payload: {
        firstName: "Cristian",
        lastName: "Torres",
        email: "ctorresthrash@gmail.com",
        username: "ctorres",
        password: "password",
        passwordConfirmation: "password" 
      }
    });

    const emailPayload = Object.assign({}, request.payload, {email: "username@gmail.com"});
  
    await server.inject(request);
    return server
      .inject(Object.assign({}, request, {payload: emailPayload})).then(response=>{
        expect(response.statusCode).to.be.equal(400);
        expect(response.result.message).to.be.equal(`Username taken\n`);
      });
  });
});