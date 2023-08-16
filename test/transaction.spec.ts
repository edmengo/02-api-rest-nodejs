import { it, afterAll, beforeAll, describe, expect, beforeEach } from 'vitest'
import { execSync } from 'node:child_process'
import supertest from 'supertest'
import { app } from '../src/app'

describe('Transactions route', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
  })

  it('should be able to create a new transaction', async () => {
    // test('user can create a new transaction', async () => {
    await supertest(app.server)
      .post('/transactions')
      .send({
        title: 'New transation',
        amount: 5000,
        type: 'credit',
      })
      .expect(201)
  })

  it('should be able to list all transactions', async () => {
    const createTransactionResponse = await supertest(app.server)
      .post('/transactions')
      .send({
        title: 'New transation',
        amount: 5000,
        type: 'credit',
      })

    const cookes = createTransactionResponse.get('Set-Cookie')

    const listTransactionResponse = await supertest(app.server)
      .get('/transactions')
      .set('Cookie', cookes)
      .expect(200)

    expect(listTransactionResponse.body.transactions).toEqual([
      expect.objectContaining({
        title: 'New transation',
        amount: 5000,
      }),
    ])
  })

  it('should be able to get a specific transactions', async () => {
    const createTransactionResponse = await supertest(app.server)
      .post('/transactions')
      .send({
        title: 'New transation',
        amount: 5000,
        type: 'credit',
      })

    const cookes = createTransactionResponse.get('Set-Cookie')

    const listTransactionResponse = await supertest(app.server)
      .get('/transactions')
      .set('Cookie', cookes)
      .expect(200)

    const transactionId = listTransactionResponse.body.transactions[0].id

    const getTransactionResponse = await supertest(app.server)
      .get(`/transactions/${transactionId}`)
      .set('Cookie', cookes)
      .expect(200)

    expect(getTransactionResponse.body.transaction).toEqual(
      expect.objectContaining({
        title: 'New transation',
        amount: 5000,
      }),
    )
  })

  it('should be able to get the summary', async () => {
    const createTransactionResponse = await supertest(app.server)
      .post('/transactions')
      .send({
        title: 'Credit transation',
        amount: 5000,
        type: 'credit',
      })

    const cookes = createTransactionResponse.get('Set-Cookie')

    await supertest(app.server)
      .post('/transactions')
      .set('Cookie', cookes)
      .send({
        title: 'Debit transation',
        amount: 2000,
        type: 'debit',
      })

    const summaryResponse = await supertest(app.server)
      .get('/transactions/summary')
      .set('Cookie', cookes)
      .expect(200)

    expect(summaryResponse.body.summary).toEqual({
      amount: 3000,
    })
  })
})
