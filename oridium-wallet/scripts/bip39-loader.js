import * as bip39 from 'https://esm.sh/@scure/bip39';
import { wordlist } from 'https://esm.sh/@scure/bip39/wordlists/english';

window.bip39 = {
  generateMnemonic: () => bip39.generateMnemonic(wordlist),
  validateMnemonic: (mnemonic) => bip39.validateMnemonic(mnemonic, wordlist)
};