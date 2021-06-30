import { EnvironmentName, environments, getEnvironment } from "./environment";

describe('environments', () => {
  it('should match Production', () => {
    const env = environments.Production

    expect(env.name).toStrictEqual(EnvironmentName.Production)
    expect(env).toMatchSnapshot()
  })

  it('should match Preview', () => {
    const env = environments.Preview

    expect(env.name).toStrictEqual(EnvironmentName.Preview)
    expect(env).toMatchSnapshot()
  })

  it('should match Development', () => {
    const env = environments.Development

    expect(env.name).toStrictEqual(EnvironmentName.Development)
    expect(env).toMatchSnapshot()
  })
})

it('should match development for default', () => {
  const env = getEnvironment()
  expect(env.name).toStrictEqual(EnvironmentName.Development)
})
