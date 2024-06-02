import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const AnnouncerModule = buildModule("ERC5564Announcer", (m) => {
  const token = m.contract("ERC5564Announcer");

  return { token };
});

module.exports = AnnouncerModule;
