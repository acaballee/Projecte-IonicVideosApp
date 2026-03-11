import { it } from "vitest"

describe('Home Page Test', () => {
  it('Visits the app root url and checks title', () => {
    cy.visit('/')
    cy.contains('ion-title', 'IonicVideosApp - Alex')
  })
})
