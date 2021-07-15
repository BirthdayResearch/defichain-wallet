# DeFi Wallet Beta Testing

## Test Setup

Requirements:

1. Mobile Device 
2. Stable Network
3. Testing URL for Expo Go, TestFlight Invite Code


The test will run on [DeFi Playground](https://github.com/DeFiCh/wallet#testing). To start testing, please follow the steps below based on your mobile device's operating system.

### Android
1. Download [Expo Go](https://play.google.com/store/apps/details?id=host.exp.exponent&hl=en&gl=US) from Play Store
2. If you have Expo Go installed on your device, please ensure that you have the latest version via Play Store for proper compatibility with the DeFi Wallet
3. Open the URL provided for testing and scan the QR code using your Expo App
4. You may also copy the Expo URL and paste it on the Expo Go App

### iOS
1. Download [TestFlight](https://apps.apple.com/us/app/testflight/id899247664) from App Store
2. If you have TestFlight installed on your device, please ensure that you have the latest version via App Store for proper compatibility with the DeFi Wallet
3. Check your email for TestFlight Invitation Link
4. Open the Link and copy the TestFlight Code
5. Open TestFlight app, Click on Redeem code on upper right corner
6. Install the application

## Test Data

### How to generate assets for your wallet
If you need UTXO or Tokens to test, you may generate them using DeFi Playground in the Wallet.

1. Create your wallet
2. Click on Settings Icon in the Bottom Navigation. 
3. Click on Remote Playground
<div>
<img alt="settings" width="30%" src="/.github/images/beta_testing/settings.jpg" />
</div>
3. It should open a new screen where you can do various operations (e.g, Top up 10 DFI UTXO, 10 BTC Token etc.).
<div>
<img alt="playground" width="30%" src="/.github/images/beta_testing/playground.jpg" />
</div>
4. Click on any operation (e.g Top Up 10 UTXO DFI) 
5. Click on Fetch Balances
6. Click Back button and navigate to balances screen using the bottom navigation
7. Check if your balance is updated. If not, try `pull to refresh` on the Balances screen to get your latest balances

## Test Results
You may post your test results on the respective GitHub Discussions thread. Please add these details for any posted feedback

- Operating System (Android or iOS) 
- Version (Android 12 or iOS 15)
- Mobile Device (Samsung S21, iPhone 12)






