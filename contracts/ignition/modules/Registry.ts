import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const RegistryModule = buildModule("ERC5564Registry", (m) => {
  const token = m.contract("ERC5564Registry");

  return { token };
});

module.exports = RegistryModule;
