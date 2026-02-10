interface SpotPaymentVerificationResult {
  valid: boolean;
  from?: string;
  to?: string;
  amount?: string;
  error?: string;
}

// USDC on Base (6 decimals)
const USDC_CONTRACT = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
// $SNR on Base (18 decimals)
const SNR_CONTRACT = '0xE1231f809124e4Aa556cD9d8c28CB33f02c75b07';

// ERC-20 Transfer event topic
const TRANSFER_EVENT_TOPIC = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';

function getPaymentAddress(): string {
  const addr = process.env.SPONSORED_PAYMENT_ADDRESS || process.env.SNR_PAYMENT_ADDRESS;
  if (!addr) throw new Error('SPONSORED_PAYMENT_ADDRESS not configured');
  return addr;
}

/**
 * Verify sponsored spot payment on Base network.
 * For USDC: verifies exact amount.
 * For SNR: verifies transfer happened to the right address with amount > 0.
 */
export async function verifySpotPayment(
  txHash: string,
  paymentToken: 'USDC' | 'SNR',
  expectedAmountUsd: number
): Promise<SpotPaymentVerificationResult> {
  try {
    const baseRpcUrl = 'https://mainnet.base.org';
    const paymentAddress = getPaymentAddress();

    const tokenContract = paymentToken === 'USDC' ? USDC_CONTRACT : SNR_CONTRACT;
    const decimals = paymentToken === 'USDC' ? 6 : 18;

    // Get transaction receipt
    const response = await fetch(baseRpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_getTransactionReceipt',
        params: [txHash],
        id: 1,
      }),
    });

    const data = await response.json();

    if (data.error) {
      return { valid: false, error: `RPC error: ${data.error.message}` };
    }

    const receipt = data.result;
    if (!receipt) {
      return { valid: false, error: 'Transaction not found or not mined' };
    }

    if (receipt.status !== '0x1') {
      return { valid: false, error: 'Transaction failed' };
    }

    // Find Transfer event for the right token contract
    const transferLog = receipt.logs.find((log: { address: string; topics: string[] }) => {
      return (
        log.topics[0] === TRANSFER_EVENT_TOPIC &&
        log.address.toLowerCase() === tokenContract.toLowerCase()
      );
    });

    if (!transferLog) {
      return { valid: false, error: `No ${paymentToken} Transfer event found in transaction` };
    }

    if (transferLog.topics.length < 3) {
      return { valid: false, error: 'Invalid Transfer event format' };
    }

    const fromAddress = '0x' + transferLog.topics[1].slice(-40);
    const toAddress = '0x' + transferLog.topics[2].slice(-40);
    const amountHex = transferLog.data;
    const amountWei = BigInt(amountHex);
    const amountTokens = Number(amountWei) / Math.pow(10, decimals);

    // Verify recipient
    if (toAddress.toLowerCase() !== paymentAddress.toLowerCase()) {
      return {
        valid: false,
        error: `Payment sent to wrong address. Expected: ${paymentAddress}, Got: ${toAddress}`,
      };
    }

    if (paymentToken === 'USDC') {
      // For USDC: verify exact amount (allow small rounding tolerance)
      if (Math.abs(amountTokens - expectedAmountUsd) > 0.01) {
        return {
          valid: false,
          error: `Incorrect USDC amount. Expected: ${expectedAmountUsd}, Got: ${amountTokens.toFixed(2)}`,
        };
      }
    } else {
      // For SNR: just verify amount > 0 (trust sender for now)
      if (amountTokens <= 0) {
        return { valid: false, error: 'SNR transfer amount must be greater than 0' };
      }
    }

    return {
      valid: true,
      from: fromAddress,
      to: toAddress,
      amount: amountTokens.toFixed(paymentToken === 'USDC' ? 2 : 4),
    };
  } catch (error) {
    console.error('Spot payment verification error:', error);
    return {
      valid: false,
      error: `Verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

export { USDC_CONTRACT, SNR_CONTRACT };
