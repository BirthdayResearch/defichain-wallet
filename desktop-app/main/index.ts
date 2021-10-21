import App from './src/app'

function main (): void {
  const electronApp = new App()
  void electronApp.run()
}

main()
