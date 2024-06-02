import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const StealthModule = buildModule("Stealth", (m) => {
  const token = m.contract("Stealth", ["0xC6b69d83DB6d40B3b644436E3A36252801fc0f64"]);

  return { token };
});

module.exports = StealthModule;
