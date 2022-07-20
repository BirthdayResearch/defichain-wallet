
import { useLanguageContext } from '@shared-contexts/LanguageProvider'

export function useTnC (): string {
    const { language } = useLanguageContext()

    const text = {
        en: tncText,
        de: tncTextDe
    }

    return text[language]
}

const tncText = `
1.  Loans on DeFiChain


1.1 Design and Functionality

Decentralized borrowing on the DeFi chain can be summarized as follows:

•   A user blocks a collateral against the Vault Smart Contract on DeFi-Chain, whereby a corresponding position of this user, a so-called «Vault», is opened. The collateral may consist of DFI, dBTC, dETH, dUSD, dUSDC, dUSDT. The Collateral may also consist of a mix of these tokens.

•   Further interaction with the Vault Smart Contract for the respective Vault can now only take place using the address (wallet) that was used for the initial blocking («Collateral Originator Address»).

•   Based on the amount of blocked collateral, this user (via his collateral originator address) can now take out a loan. The total loan that can be taken out, depends on the amount of blocked collateral. In this context, the value of the loan is determined on the basis of the underlying market values. A predefined collateral ratio determines the maximum ratio of loan to blocked collateral. Initially, this collateral ratio is 150%. The DeFiChain creates a new loan each time and the user can take out the loan in the same or different tokens. The loan can be taken out in the following tokens: dUSD, dTSLA, dBABA, dGME, dPLTR, dAAPL, dGOOGL, dARKK, dSPY, dQQQ, dGLD, dSLV, dPDBC, dVNQ, dURTH, dTLT, dBURN, dCOIN, dAMZN, dEEM, dNVDA, dMSFT, dVOO, dFB, dNFLX, dDIS, dMSTR, dMCHI, dINTC, dPYPL, dKO, dBRK.B, dPG, dSAP, dCS, dGSG, dURA, dPPLT, dGOVT, dXOM, dTAN .

•   The collateral ratio has different levels which determine the amount of interest to be paid. The interest is shown as APR and always refers to a 1 year period. The higher the collateral ratio, the lower the fees to be paid («interest»). Since the interest "accrues" with each new block and can only be settled on the occasion of the repayment of the loan to the Vault, the Collateral Ratio continuously deteriorates. However, there is no obligation to repay the loan. This is the responsibility of the borrower. The levels are as follows:

1) 1000% (Min Collateralization Ratio) - 0,5% APR
2) 500% (Min Collateralization Ratio) - 1% APR
3) 350% (Min Collateralization Ratio) - 1,5% APR
4) 200% (Min Collateralization Ratio) - 2% APR
5) 175% (Min Collateralization Ratio) - 3% APR
6) 150% (Min Collateralization Ratio) - 5% APR


1.2 Liquidation and Loan Repayment

•   If, due to price fluctuations, the collateral ratio is undercut (e.g. a decline in the value of the collateral or an increase in the underlying market values measured in $USD), the position or the vault of the corresponding user can be liquidated. In this case, the collateral of the liquidated Vault is automatically auctioned off. Neither DFX AG nor the users are involved in the liquidation of the corresponding Vault, but the Smart Contract automatically liquidates the Vaults if the collateral falls below the Minimum Collateralization Ratio. The borrower must always provide sufficient collateral to avoid liquidation.
Each user can then bid on the collateral of the liquidated vault. The 1st bid must be 5% higher than the price of the loan at the time of liquidation. This is the liquidation penalty. Subsequent bids need only be 1% higher than the previous price. Bids can be submitted via DFX Wallet in the Auctions section.

•   The underlying price values and the prices of the collateral (price feeds) are fed into the DeFiChain by so-called price oracles.

•   Only the collateral originator address can finally repay the loan back to the Vault, which increases its collateral ratio again. Consequently, part of the collateral can be deblocked or the loan can be extended.

•   Loans that are transferred back to the Vault and thus repaid, as well as the interest due, are destroyed by the Vault Smart Contract ("burn mechanism"). Loans as well as the interest can only be repaid with the tokens with which the loan was originally taken out.`

const tncTextDe = `
1.  Kreditaufnahme auf der DeFiChain


1.1 Ausgestaltung und Funktionalität

Die dezentrale Kreditaufnahme auf der DeFi-Chain lässt sich wie folgt zusammenfassen:

•   Ein Nutzer blockiert ein Collateral gegenüber dem Vault Smart Contract auf der DeFi-Chain, wobei eine entsprechende Position dieses Nutzers, ein sogenannter «Vault», geöffnet wird. Das Collateral kann aus DFI, dBTC, dETH, dUSD, dUSDC, dUSDT bestehen. Auch kann das Collateral aus einem Mix dieser Token bestehen.

•   Die weitere Interaktion mit dem Vault Smart Contract kann für den betreffenden Vault nun nur noch mittels jener Adresse (Wallet) erfolgen, welche zur initialen Blockierung verwendet wurde («Collateral Originator Adresse»).

•   Basierend auf der Menge an geblocktem Collateral kann dieser Nutzer (via seine Collateral Originator Adresse) nun einen Kredit beziehen. Die Höhe des beziehbaren Kredits ist dabei abhängig vom Umfang des blockierten Collaterals. Der Wert des Kredits wird in diesem Zusammenhang anhand der zugrundeliegenden Kurswerte bestimmt. Eine vordefinierte Collateral-Ratio bestimmt dabei das maximale Verhältnis vom bezogenen Kredit zum blockierten Collateral. Initial beträgt diese Collateral-Ratio 150%. Die DeFi-Chain kreiert den bezogenen Kredit jeweils neu und der Nutzer kann den Kredit dabei gleiche oder verschiedenartigen Token beziehen. Der Kredit kann in Form von folgenden Token genommen werden: dUSD, dTSLA, dBABA, dGME, dPLTR, dAAPL, dGOOGL, dARKK, dSPY, dQQQ, dGLD, dSLV, dPDBC, dVNQ, dURTH, dTLT, dBURN, dCOIN, dAMZN, dEEM, dNVDA, dMSFT, dVOO, dFB, dNFLX, dDIS, dMSTR, dMCHI, dINTC, dPYPL, dKO, dBRK.B, dPG, dSAP, dCS, dGSG, dURA, dPPLT, dGOVT, dXOM, dTAN .

•   Das Collateral-Ratio hat verschiedene Stufen, welche die Höhe der zu zahlenden Zinsen bestimmt. Die Zinsen sind als APR ausgewiesen und beziehen sich immer auf ein 1 Jahr. Je höher die Collateral Ratio, desto geringer sind die zu zahlenden Gebühren («Zinsen»). Da die Zinsen mit jedem neuen Block «verzinst» werden und diese erst anlässlich der Rückzahlung des Kredits an den Vault beglichen werden können, verschlechtert sich laufend die Collateral Ratio. Es besteht jedoch kein Zwang, den Kredit zu tilgen. Dies obliegt dem Kreditnehmer. Die Stufen lauten wie folgt:

1) 1000% (Min Collateralization Ratio) - 0,5% APR
2) 500% (Min Collateralization Ratio) - 1% APR
3) 350% (Min Collateralization Ratio) - 1,5% APR
4) 200% (Min Collateralization Ratio) - 2% APR
5) 175% (Min Collateralization Ratio) - 3% APR
6) 150% (Min Collateralization Ratio) - 5% APR


1.2 Liquidation und Kredittilgung

•   Wenn, aufgrund von Kursschwankungen die Collateral-Ratio unterschritten wird (z.B. Wertverfall des Collaterals oder Ansteigen der zugrundeliegenden Kurswerte gemessen in $USD), kann die Position bzw. der Vault des entsprechenden Nutzers liquidiert werden. Dabei wird das Collateral des liquidierten Vaults automatisch verauktioniert. Weder die DFX AG noch die Nutzer sind in der Liquidierung der entsprechenden Vault involviert, sondern der Smart Contract liquidiert die Vaults automatisch, falls das Collateral unter die Minimum Collateralization Ratio fällt. Der Kreditnehmer muss stets ausreichend Collateral vorhalten, um nicht liquidiert zu werden.
Jeder Nutzer kann dann auf das Collateral des liquidierten Vaults bieten. Das 1. Gebot muss 5% höher sein als der Preis des Kredits zum Zeitpunkt der Liquidation. Dies ist die Liquidierung Strafe. Nachfolgende Gebote müssen lediglich 1% höher sein, als der vorherige Preis. Gebote können über die DFX Wallet im Bereich Auktionen angegeben werden.

•   Die zugrundeliegenden Kurswerte und die Kurse des Collaterals (Pricefeeds) werden dabei von sogenannten Oracles in die DeFi-Chain eingespiesen.

•   Nur die Collateral Originator Adresse kann schliesslich den Kredit an den Vault zurücktransferieren, wodurch sich seine Collateral-Ratio wieder erhöht. Folglich kann ein Teil des Collaterals deblockiert oder es kann der Kredit ausgeweitet werden.

•   Kredite, welche an den Vault zurücktransferiert und somit getilgt werden, sowie auch die fälligen Zinsen, werden durch den Vault Smart Contract zerstört (“Burn Mechanismus”). Kredite sowie die Zinsen können nur mit den Token getilgt werden, mit denen der Kredit ursprünglich genommen worden ist.`
